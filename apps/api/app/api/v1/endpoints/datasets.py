"""
Dataset upload + management endpoints (Admin only).
"""
import io
import os
from pathlib import Path

import pandas as pd
import structlog
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pypdf import PdfReader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.dataset import Dataset, DatasetDocument
from app.models.user import User
from app.schemas import DatasetResponse
from app.services.audit_service import log_action
from app.services.rag_engine import get_embedding

log = structlog.get_logger()
router = APIRouter()


def _chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[str]:
    """Split text into overlapping chunks for embedding."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i : i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


async def _parse_file(file: UploadFile) -> list[str]:
    """Parse CSV or PDF and return text chunks."""
    content = await file.read()
    filename = file.filename or ""

    if filename.lower().endswith(".csv"):
        df = pd.read_csv(io.BytesIO(content))
        texts = df.apply(lambda row: " | ".join(str(v) for v in row.values), axis=1).tolist()
        return texts
    elif filename.lower().endswith(".pdf"):
        reader = PdfReader(io.BytesIO(content))
        full_text = "\n".join(page.extract_text() or "" for page in reader.pages)
        return _chunk_text(full_text)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use CSV or PDF.")


@router.get("/", response_model=list[DatasetResponse])
async def list_datasets(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    result = await db.execute(select(Dataset).order_by(Dataset.created_at.desc()))
    return result.scalars().all()


@router.post("/upload", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    name: str = Form(...),
    source: str = Form(...),
    description: str = Form(default=""),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    # Save file locally
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / (file.filename or "upload.csv")

    # Parse
    chunks = await _parse_file(file)
    if not chunks:
        raise HTTPException(status_code=400, detail="File is empty or could not be parsed")

    dataset = Dataset(
        name=name,
        source=source,
        description=description,
        file_path=str(file_path),
        document_count=0,
    )
    db.add(dataset)
    await db.flush()
    await db.refresh(dataset)

    # Generate embeddings and store documents
    doc_count = 0
    for i, chunk in enumerate(chunks[:500]):  # limit to 500 chunks per upload
        try:
            embedding = await get_embedding(chunk)
            from sqlalchemy import text
            await db.execute(
                text("""
                    INSERT INTO dataset_documents (dataset_id, title, content, embedding)
                    VALUES (:dataset_id, :title, :content, :embedding::vector)
                """),
                {
                    "dataset_id": dataset.id,
                    "title": f"{name} — chunk {i+1}",
                    "content": chunk,
                    "embedding": f"[{','.join(str(x) for x in embedding)}]",
                },
            )
            doc_count += 1
        except Exception as e:
            log.warning("Embedding failed for chunk", chunk_index=i, error=str(e))
            # Store without embedding
            doc = DatasetDocument(
                dataset_id=dataset.id,
                title=f"{name} — chunk {i+1}",
                content=chunk,
            )
            db.add(doc)
            doc_count += 1

    dataset.document_count = doc_count
    await db.flush()

    await log_action(
        db,
        "DATASET_UPLOADED",
        user_id=current_admin.id,
        metadata={"dataset_id": dataset.id, "name": name, "chunks": doc_count},
    )

    log.info("Dataset uploaded", dataset_id=dataset.id, name=name, chunks=doc_count)
    return dataset


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dataset(
    dataset_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    await db.delete(dataset)
    await log_action(db, "DATASET_DELETED", user_id=current_admin.id, metadata={"dataset_id": dataset_id})
