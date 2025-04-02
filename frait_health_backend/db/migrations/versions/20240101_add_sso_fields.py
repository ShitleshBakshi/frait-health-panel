"""add sso fields

Revision ID: add_sso_fields
Revises:
Create Date: 2024-01-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_sso_fields'
down_revision = '94a22a3a9e71'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add SSO-related columns to user table
    op.add_column('user_model', sa.Column('external_id', sa.String(), nullable=True))
    op.add_column('user_model', sa.Column('identity_provider', sa.String(), nullable=True))
    op.add_column('user_model', sa.Column('sso_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True))

    # Add unique constraint on external_id
    op.create_unique_constraint('uq_user_external_id', 'user_model', ['external_id'])

def downgrade() -> None:
    # Remove SSO-related columns from user table
    op.drop_constraint('uq_user_external_id', 'user_model', type_='unique')
    op.drop_column('user_model', 'sso_metadata')
    op.drop_column('user_model', 'identity_provider')
    op.drop_column('user_model', 'external_id')
