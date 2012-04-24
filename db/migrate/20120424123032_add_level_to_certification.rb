class AddLevelToCertification < ActiveRecord::Migration
  def change
    add_column :certifications, :user, :boolean, default: 0
    add_column :certifications, :manager, :boolean, default: 0
  end
end
