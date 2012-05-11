class CreateTickets < ActiveRecord::Migration
  def change
    create_table :tickets do |t|
      t.integer :shift_id
      t.float :value
      t.boolean :used

      t.timestamps
    end
  end
end
