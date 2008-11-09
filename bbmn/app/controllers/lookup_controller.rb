class LookupController < ApplicationController
  def index
	  render :json => (params[:url] ? bmn_lookup(params[:url]) : {}), :callback => params[:callback]
  end
end
