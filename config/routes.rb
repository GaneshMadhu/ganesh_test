Rails.application.routes.draw do
  root 'ember#bootstrap'
  resources :schedules, defaults: {format: 'json'}
end
