class AddTicketValueToShiftTypes < ActiveRecord::Migration
  def change
    add_column :shift_types, :ticket_value, :integer
  end
end
