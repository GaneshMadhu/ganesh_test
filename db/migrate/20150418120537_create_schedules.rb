class CreateSchedules < ActiveRecord::Migration
  def change
    create_table :schedules do |t|
      t.string :schedule_type
      t.string :uid
      t.string :name
      t.string :enterprise_id
      t.string :group_id
      t.string :location
      t.string :user_name

      t.timestamps null: false
    end
  end
end
