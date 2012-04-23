class CreateShiftTypes < ActiveRecord::Migration
  def change
    create_table :shift_types do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.string :location, null: false

      t.timestamps
    end
  end
end
