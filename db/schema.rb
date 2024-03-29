# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20121001185119) do

  create_table "certifications", :force => true do |t|
    t.integer  "shift_type_id",                    :null => false
    t.integer  "user_group_id",                    :null => false
    t.datetime "created_at",                       :null => false
    t.datetime "updated_at",                       :null => false
    t.boolean  "user",          :default => false
    t.boolean  "manager",       :default => false
  end

  create_table "managed_user_groups", :force => true do |t|
    t.integer "manager_id", :null => false
    t.integer "group_id",   :null => false
  end

  add_index "managed_user_groups", ["group_id"], :name => "index_managed_user_groups_on_group_id"
  add_index "managed_user_groups", ["manager_id"], :name => "index_managed_user_groups_on_manager_id"

  create_table "shift_types", :force => true do |t|
    t.string   "title",        :null => false
    t.text     "description",  :null => false
    t.string   "location",     :null => false
    t.datetime "created_at",   :null => false
    t.datetime "updated_at",   :null => false
    t.integer  "ticket_value"
  end

  create_table "shifts", :force => true do |t|
    t.integer  "shift_type_id",                        :null => false
    t.integer  "task_id"
    t.datetime "start",                                :null => false
    t.datetime "end",                                  :null => false
    t.boolean  "training",          :default => false, :null => false
    t.text     "comment"
    t.boolean  "leasing",           :default => false, :null => false
    t.datetime "created_at",                           :null => false
    t.datetime "updated_at",                           :null => false
    t.integer  "user_id"
    t.integer  "ticket_id"
    t.integer  "signed_by_id"
    t.integer  "template_shift_id"
  end

  create_table "tasks", :force => true do |t|
    t.integer  "user_id"
    t.text     "description"
    t.string   "title"
    t.integer  "user_group_id"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
  end

  create_table "template_shifts", :force => true do |t|
    t.datetime "start"
    t.datetime "stop"
    t.integer  "shift_type_id"
    t.string   "comment"
    t.boolean  "training"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
    t.integer  "template_id"
  end

  create_table "templates", :force => true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "start"
    t.datetime "stop"
    t.integer  "interval"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "tickets", :force => true do |t|
    t.integer  "task_id"
    t.float    "value"
    t.boolean  "used"
    t.datetime "created_at",   :null => false
    t.datetime "updated_at",   :null => false
    t.integer  "user_id"
    t.text     "comment"
    t.integer  "issued_by_id"
    t.date     "expires"
  end

  create_table "user_groups", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "user_groups_users", :id => false, :force => true do |t|
    t.integer "user_id",       :null => false
    t.integer "user_group_id", :null => false
  end

  create_table "users", :force => true do |t|
    t.string   "username",                         :null => false
    t.datetime "last_login"
    t.datetime "created_at",                       :null => false
    t.datetime "updated_at",                       :null => false
    t.string   "password_hash"
    t.string   "password_salt"
    t.boolean  "admin",         :default => false
  end

end
