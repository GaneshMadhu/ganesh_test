class SchedulesController < ApplicationController
  respond_to :json, :xml
def index
 p "88888888888888888888888"
  a = {id:1043, schedule_type:nil, created_at:"Thu, 09 Apr 2015 04:39:46 UTC +00:00", updated_at:"Thu, 09 Apr 2015 04:39:46 UTC +00:00", uid:nil, name:"GM", enterprise_id:1001121, group_id:10715, user_name:nil, user_id:nil, location:nil, schedule_level:"enterprise", schedule_kind:"Time"}
  p "&&&&&&&&&&&&&&&&&&&"
 p a.as_json(root: false)
 p "&&&&&&&&&&&&&&&&&&&"
 respond_to do |format|
   format.json {render json: { "schedules" => Schedule.all }.to_json }
 end
end
end
