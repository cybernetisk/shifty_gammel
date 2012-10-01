class CreateTemplateShifts < ActiveRecord::Migration
  def change
    create_table :template_shifts do |t|
      t.datetime :start
      t.datetime :stop
      t.integer :shift_type_id
      t.string :comment
      t.boolean :training

      t.timestamps
    end
  end
end
