"""empty message

Revision ID: e72ffd76be40
Revises: 0001c8ac1a69
Create Date: 2017-04-05 14:07:11.702670

"""

# revision identifiers, used by Alembic.
revision = 'e72ffd76be40'
down_revision = '0001c8ac1a69'

from alembic import op
import sqlalchemy as sa


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('graphs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=50), server_default=u'', nullable=False),
    sa.Column('description', sa.String(length=1000), server_default=u'', nullable=False),
    sa.Column('nodes', sa.String(length=10000), server_default=u'', nullable=False),
    sa.Column('edges', sa.String(length=10000), server_default=u'', nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('roles',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=50), server_default=u'', nullable=False),
    sa.Column('label', sa.Unicode(length=255), server_default=u'', nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.Unicode(length=255), server_default=u'', nullable=False),
    sa.Column('confirmed_at', sa.DateTime(), nullable=True),
    sa.Column('password', sa.String(length=255), server_default='', nullable=False),
    sa.Column('is_active', sa.Boolean(), server_default='0', nullable=False),
    sa.Column('first_name', sa.Unicode(length=50), server_default=u'', nullable=False),
    sa.Column('last_name', sa.Unicode(length=50), server_default=u'', nullable=False),
    sa.Column('photo_file_name', sa.String(length=260), server_default=u'', nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('friendships',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('friender_id', sa.Integer(), nullable=True),
    sa.Column('friendee_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['friendee_id'], ['users.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['friender_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users_graphs_helpers',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('graph_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['graph_id'], ['graphs.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users_graphs_owner',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('graph_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['graph_id'], ['graphs.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users_roles',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('role_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users_friendships',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('friendship_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['friendship_id'], ['friendships.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('role')
    op.drop_table('user_roles')
    op.drop_table('user')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('username', sa.VARCHAR(length=50), nullable=False),
    sa.Column('password', sa.VARCHAR(length=255), server_default=sa.text(u"''"), nullable=False),
    sa.Column('reset_password_token', sa.VARCHAR(length=100), server_default=sa.text(u"''"), nullable=False),
    sa.Column('email', sa.VARCHAR(length=255), nullable=False),
    sa.Column('confirmed_at', sa.DATETIME(), nullable=True),
    sa.Column('is_active', sa.BOOLEAN(), server_default=sa.text(u"'0'"), nullable=False),
    sa.Column('first_name', sa.VARCHAR(length=50), server_default=sa.text(u"''"), nullable=False),
    sa.Column('last_name', sa.VARCHAR(length=50), server_default=sa.text(u"''"), nullable=False),
    sa.Column('photo_file_name', sa.VARCHAR(length=260), server_default=sa.text(u"''"), nullable=False),
    sa.CheckConstraint(u'is_active IN (0, 1)'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    op.create_table('user_roles',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('user_id', sa.INTEGER(), nullable=True),
    sa.Column('role_id', sa.INTEGER(), nullable=True),
    sa.ForeignKeyConstraint(['role_id'], [u'role.id'], ondelete=u'CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], [u'user.id'], ondelete=u'CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('role',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('name', sa.VARCHAR(length=50), nullable=True),
    sa.Column('description', sa.VARCHAR(length=255), server_default=sa.text(u"''"), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.drop_table('users_friendships')
    op.drop_table('users_roles')
    op.drop_table('users_graphs_owner')
    op.drop_table('users_graphs_helpers')
    op.drop_table('friendships')
    op.drop_table('users')
    op.drop_table('roles')
    op.drop_table('graphs')
    # ### end Alembic commands ###
