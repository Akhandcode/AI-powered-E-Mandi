# Import all ORM models so Base metadata has them registered
from app.db.database import Base  # noqa
from app.models.user import User  # noqa
from app.models.lot import InspectionLot, LotImage  # noqa
from app.models.assessment import GradingResult  # noqa
from app.models.report import QualityReport  # noqa
