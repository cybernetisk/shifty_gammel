class AddAdminToUser < ActiveRecord::Migration
  def change
    add_column :users, :admin, :boolean, default: 'f'
  end
end
