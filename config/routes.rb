Railsdemo::Application.routes.draw do

  # Route
  root :to => "users#new"

  # Manual routes
  get 'sign_up' => 'users#new', as: 'sign_up'
  get "log_out" => "sessions#destroy", :as => "log_out"
  get "log_in" => "sessions#new", :as => "log_in"
  get "user_groups/:id/certify" => 'user_groups#certify'
  post "user_groups/:id/certify" => 'user_groups#update_certifications'
  get "users/:id/groups" => "users#groups"
  post "users/:id/groups" => "users#update_groups"
  
  # Lagt til av Mari
  match 'tickets/showForUser/:id' => 'tickets#showForUser', :as => :tickets_for_user
  match 'shifts/showAvailable' => 'shifts#showAvailable', :as => :available_shifts
  match 'shifts/showForDate/:date' => 'shifts#showForDate', :as => :shifts_for_date
  match 'shifts/start/' => 'shifts#start', :as => :shifts_start
  
  # Default CRUD routes
  resources :shift_types
  resources :shifts
  resources :users
  resources :sessions
  resources :user_groups
  resources :tickets
  resources :tasks
  
  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
