"""Remove Azure AD fields

Revision ID: 2025_04_13_13_35_remove_azure
Revises: 2025-04-13-12-35_createtables
Create Date: 2025-04-13 13:35:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '2025_04_13_13_35_remove_azure'
down_revision = '2025-04-13-12-35_createtables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop Azure AD specific fields
    op.drop_constraint('uq_user_external_id', 'user_model', type_='unique')
    op.drop_column('user_model', 'external_id')
    op.drop_column('user_model', 'identity_provider')
    op.drop_column('user_model', 'sso_metadata')


def downgrade() -> None:
    # Re-add Azure AD specific fields
    op.add_column('user_model', sa.Column('external_id', sa.String(length=200), nullable=True))
    op.add_column('user_model', sa.Column('identity_provider', sa.String(length=200), nullable=True))
    op.add_column('user_model', sa.Column('sso_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.create_unique_constraint('uq_user_external_id', 'user_model', ['external_id'])