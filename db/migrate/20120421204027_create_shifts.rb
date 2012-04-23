class CreateShifts < ActiveRecord::Migration
  def change
    create_table :shifts do |t|
      t.integer :shift_type_id, null: false
      t.integer :user_id, null: true
      t.integer :certification_id, null: true
      t.datetime :start, null: false
      t.datetime :end, null: false
      t.boolean :training, null: false
      t.text :comment, null: false
      t.boolean :leasing, null: false

      t.timestamps
    end
  end
end
