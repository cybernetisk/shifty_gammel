class AddIssuedByIdToTicket < ActiveRecord::Migration
  def change
    add_column :tickets, :issued_by_id, :integer
  end
end
