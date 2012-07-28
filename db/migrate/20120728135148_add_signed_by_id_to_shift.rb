class AddSignedByIdToShift < ActiveRecord::Migration
  def change
    add_column :shifts, :signed_by_id, :integer
  end
end
