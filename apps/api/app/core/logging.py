import logging
import sys
import structlog

def setup_logging():
    """
    Configure structlog for JSON production logging.
    """
    processors = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    if sys.stderr.isatty():
        # Pretty print in development
        processors.append(structlog.dev.ConsoleRenderer())
    else:
        # JSON in production
        processors.append(structlog.processors.JSONRenderer())

    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Bridge standard logging to structlog
    handler = logging.StreamHandler()
    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)
