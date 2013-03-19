#Date::DATE_FORMATS[:default] = "%Y-%m-%d"
#Time::DATE_FORMATS[:default] = "%Y-%m-%d %H:%M:%S %z"

class ActiveSupport::TimeWithZone
  def as_json(options = {})
    strftime('%Y-%m-%d %H:%M:%S %z')
  end
end