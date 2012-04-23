class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :username, null: false
      t.datetime :last_login, null: true

      t.timestamps
    end
  end
end
