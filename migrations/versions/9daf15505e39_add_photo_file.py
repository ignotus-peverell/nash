"""Add photo file

Revision ID: 9daf15505e39
Revises: 0001c8ac1a69
Create Date: 2017-04-08 02:57:20.422820

"""

# revision identifiers, used by Alembic.
revision = '9daf15505e39'
down_revision = '0001c8ac1a69'

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column('users', sa.Column('photo_file_name', sa.String(length=260), server_default=u'', nullable=True))


def downgrade():
    # sqlite doesn't support dropping columns
    # op.drop_column('users', 'photo_file_name')
    pass
