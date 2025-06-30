"""create_all_tables

Revision ID: <alembic will generate this>
Revises: <alembic will generate this>
Create Date: <alembic will generate this>

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = 'createtables'  # Keep what Alembic generated
down_revision = None  # Keep what Alembic generated
branch_labels = None
depends_on = None


def upgrade():
    # Create user_model table
    op.create_table(
        'user_model',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('email', sa.String(length=200), nullable=False),
        sa.Column('username', sa.String(length=200), nullable=True),
        sa.Column('role', sa.String(length=200), nullable=False),
        sa.Column('external_id', sa.String(length=200), nullable=True),
        sa.Column('identity_provider', sa.String(length=200), nullable=True),
        sa.Column('sso_metadata', postgresql.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('external_id'),
        sa.UniqueConstraint('username')
    )
    op.create_index(op.f('ix_user_model_email'), 'user_model', ['email'], unique=True)

    # Create initial_families table
    op.create_table(
        'initial_families',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('family_name', sa.String(length=200), nullable=False),
        sa.Column('child_dob', sa.String(length=200), nullable=False),
        sa.Column('nhs_number', sa.String(length=200), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create family_details table
    op.create_table(
        'family_details',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('main_parent_first_name', sa.String(length=200), nullable=False),
        sa.Column('main_parent_last_name', sa.String(length=200), nullable=False),
        sa.Column('main_parent_dob', sa.String(length=200), nullable=False),
        sa.Column('main_parent_gender', sa.String(length=100), nullable=False),
        sa.Column('main_parent_relation_to_child', sa.String(length=100), nullable=False),
        sa.Column('main_parent_education_level', sa.String(length=200), nullable=False),
        sa.Column('main_parent_parental_responsibility', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('main_parent_information_provider', sa.Boolean(), nullable=False, server_default='false'),
        sa.ForeignKeyConstraint(['id'], ['initial_families.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create supporting_parents table
    op.create_table(
        'supporting_parents',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('family_id', sa.Integer(), nullable=False),
        sa.Column('first_name', sa.String(length=200), nullable=False),
        sa.Column('last_name', sa.String(length=200), nullable=False),
        sa.Column('dob', sa.String(length=200), nullable=False),
        sa.Column('gender', sa.String(length=100), nullable=False, server_default=''),
        sa.Column('relation_to_child', sa.String(length=100), nullable=False, server_default=''),
        sa.Column('education_level', sa.String(length=200), nullable=False, server_default=''),
        sa.Column('parental_responsibility', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('information_provider', sa.Boolean(), nullable=False, server_default='false'),
        sa.ForeignKeyConstraint(['family_id'], ['family_details.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create children table
    op.create_table(
        'children',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('family_id', sa.Integer(), nullable=False),
        sa.Column('first_name', sa.String(length=200), nullable=False),
        sa.Column('last_name', sa.String(length=200), nullable=False),
        sa.Column('gender', sa.String(length=100), nullable=False),
        sa.Column('dob', sa.String(length=200), nullable=False),
        sa.Column('support_parent', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('support_parent_first_name', sa.String(length=200), nullable=False),
        sa.Column('support_parent_last_name', sa.String(length=200), nullable=False),
        sa.ForeignKeyConstraint(['family_id'], ['family_details.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create frai_assessment table
    op.create_table(
        'frai_assessment',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('assessmentid', sa.String(length=200), nullable=False),
        sa.Column('responsive_parenting', sa.String(length=200), nullable=False),
        sa.Column('family_health', sa.String(length=200), nullable=False),
        sa.Column('family_engagement', sa.String(length=200), nullable=False),
        sa.Column('family_support', sa.String(length=200), nullable=False),
        sa.Column('socio_economic', sa.String(length=200), nullable=False),
        sa.Column('overall_score', sa.String(length=200), nullable=False),
        sa.ForeignKeyConstraint(['id'], ['initial_families.id'], ),
        sa.PrimaryKeyConstraint('id', 'assessmentid')
    )

    # Create frat_assessment table
    op.create_table(
        'frat_assessment',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('assessmentid', sa.String(length=200), nullable=False),
        sa.Column('assessment_1', sa.String(length=200), nullable=True),
        sa.Column('assessment_2', sa.String(length=200), nullable=False),
        sa.Column('assessment_3', sa.String(length=200), nullable=True),
        sa.Column('assessment_4', sa.String(length=200), nullable=False),
        sa.Column('assessment_5', sa.String(length=200), nullable=True),
        sa.Column('assessment_6', sa.String(length=200), nullable=True),
        sa.Column('assessment_7', sa.String(length=200), nullable=True),
        sa.Column('assessment_8', sa.String(length=200), nullable=True),
        sa.Column('assessment_9', sa.String(length=200), nullable=True),
        sa.Column('assessment_10', sa.String(length=200), nullable=True),
        sa.Column('assessment_11', sa.String(length=200), nullable=True),
        sa.Column('assessment_12', sa.String(length=200), nullable=True),
        sa.Column('assessment_13', sa.String(length=200), nullable=True),
        sa.Column('assessment_14', sa.String(length=200), nullable=True),
        sa.Column('assessment_15', sa.String(length=200), nullable=True),
        sa.Column('assessment_16', sa.String(length=200), nullable=False),
        sa.Column('assessment_17', sa.String(length=200), nullable=True),
        sa.Column('assessment_18', sa.String(length=200), nullable=False),
        sa.Column('assessment_19', sa.String(length=200), nullable=True),
        sa.Column('assessment_20', sa.String(length=200), nullable=True),
        sa.Column('assessment_21', sa.String(length=200), nullable=False),
        sa.Column('assessment_22', sa.String(length=200), nullable=True),
        sa.Column('assessment_23', sa.String(length=200), nullable=True),
        sa.Column('assessment_24', sa.String(length=200), nullable=True),
        sa.Column('assessment_25', sa.String(length=200), nullable=True),
        sa.Column('assessment_26', sa.String(length=200), nullable=True),
        sa.Column('assessment_27', sa.String(length=200), nullable=True),
        sa.Column('assessment_28', sa.String(length=200), nullable=True),
        sa.Column('assessment_29', sa.String(length=200), nullable=True),
        sa.Column('assessment_30', sa.String(length=200), nullable=True),
        sa.Column('assessment_31', sa.String(length=200), nullable=True),
        sa.Column('assessment_32', sa.String(length=200), nullable=True),
        sa.Column('assessment_33', sa.String(length=200), nullable=True),
        sa.Column('assessment_34', sa.String(length=200), nullable=True),
        sa.Column('assessment_35', sa.String(length=200), nullable=True),
        sa.Column('assessment_36', sa.String(length=200), nullable=True),
        sa.ForeignKeyConstraint(['id'], ['initial_families.id'], ),
        sa.PrimaryKeyConstraint('id', 'assessmentid')
    )


def downgrade():
    # Drop tables in reverse order of creation (to handle foreign key constraints)
    op.drop_table('frat_assessment')
    op.drop_table('frai_assessment')
    op.drop_table('children')
    op.drop_table('supporting_parents')
    op.drop_table('family_details')
    op.drop_table('initial_families')
    op.drop_index(op.f('ix_user_model_email'), table_name='user_model')
    op.drop_table('user_model')
