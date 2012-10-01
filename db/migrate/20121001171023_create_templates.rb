class CreateTemplates < ActiveRecord::Migration
  def change
    create_table :templates do |t|
      t.string :title
      t.text :description
      t.datetime :start
      t.datetime :stop
      t.integer :interval

      t.timestamps
    end
  end
end
