"""Add Azure AD fields to user model.

Revision ID: add_azure_ad_fields
Revises: 
Create Date: 2023-06-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_azure_ad_fields'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add Azure AD fields to user model."""
    # Add external_id column
    op.add_column(
        'user_model',
        sa.Column('external_id', sa.String(length=200), nullable=True),
    )
    op.create_index(
        op.f('ix_user_model_external_id'),
        'user_model',
        ['external_id'],
        unique=False,
    )
    
    # Add identity_provider column
    op.add_column(
        'user_model',
        sa.Column('identity_provider', sa.String(length=50), nullable=True),
    )
    
    # Add sso_metadata column
    op.add_column(
        'user_model',
        sa.Column('sso_metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )


def downgrade() -> None:
    """Remove Azure AD fields from user model."""
    # Drop sso_metadata column
    op.drop_column('user_model', 'sso_metadata')
    
    # Drop identity_provider column
    op.drop_column('user_model', 'identity_provider')
    
    # Drop external_id column and index
    op.drop_index(op.f('ix_user_model_external_id'), table_name='user_model')
    op.drop_column('user_model', 'external_id')