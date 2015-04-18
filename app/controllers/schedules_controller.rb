class SchedulesController < ApplicationController
  respond_to :json, :xml
def index
 respond_to do |format|
   format.json {render json: { "schedules" => Schedule.all }.to_json }
 end
end
end
