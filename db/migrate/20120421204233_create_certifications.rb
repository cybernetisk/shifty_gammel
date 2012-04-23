class CreateCertifications < ActiveRecord::Migration
  def change
    create_table :certifications do |t|
      t.integer :shift_type_id, null: false
      t.integer :user_id, null: false

      t.timestamps
    end
  end
end
