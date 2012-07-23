class AddTicketIdToShift < ActiveRecord::Migration
  def change
    add_column :shifts, :ticket_id, :integer
  end
end
