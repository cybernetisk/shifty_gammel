namespace :data do
  desc "Assign tickets to random people"
  task :tickets => :environment do
    users = User.all

    300.times do
      Ticket.new do |t|
        t.value = rand(4) + 1
        t.user = users.sample
        t.comment = "lol"
        t.save
      end
    end
  end

  desc "Generate an example week"
  task :generate => :environment do
    today = DateTime.now.beginning_of_week
    print "Making shift types\n"
    makeshifts
    print "Making users\n"
    genusers
    print "Generating shifts (this might take a little while)\n"
    1.times{|i| makeweek(i.weeks.since today)}
  end

  def genusers
    User.new do |u|
      u.username = "Admin"
      u.password = "hemmelig"
      u.last_login = DateTime.now
      u.admin = true
      u.save
    end

    User.new do |u|
      u.username = "User"
      u.password = "hemmelig"
      u.last_login = DateTime.now
      u.admin = false
      u.save
    end

    names = ["ole","gunnar","lise","lol","asbjorn","thomas"]
    lastnames = ["bjornsen","eliasen","johansen","mikkel","gronvold"]

    10.times do
      User.new do |u|
        u.username = names.sample + lastnames.sample
        u.password = "hemmelig"
        u.last_login = DateTime.now
        u.admin = false
        u.save
      end
    end
  end

  def makeshifts
    ShiftType.new do |s|
      s.title = "Barskift"
      s.ticket_value = 1
      s.location = 'kjelleren'
      s.description = "En helt vanlig vakt bak baren paa pub."
      s.save
    end

    ShiftType.new do |s|
      s.title = "Kafevakt"
      s.ticket_value = 1
      s.location = 'kjelleren'
      s.description = "En vakt i kafeen."
      s.save
    end

    ShiftType.new do |s|
      s.title = "Vakt"
      s.ticket_value = 1
      s.location = 'kjelleren'
      s.description = "Vakt paa pubkvelder."
      s.save
    end
  end

  def gs(name)
    s = ShiftType.first(:conditions=>{:title=>name})
    if s == nil
      raise name + " not found"
    end
    return s
  end

  def makeweek(start)
    5.times{ |i|
      makeweekday(i.days.since start)
    }

    makepub 4.days.since start
  end

  def makeweekday(date)
    st = gs "Kafevakt"
    makeshift date.change(:hour=>8), 6.hours, st, rand(2) == 1
    makeshift date.change(:hour=>9), 6.hours, st, rand(2) == 1
    makeshift date.change(:hour=>15), 6.hours, st, rand(2) == 1
    makeshift date.change(:hour=>16), 6.hours, st, rand(2) == 1
  end

  def makepub(date)
    st = gs "Barskift"
    makeshift date.change(:hour=>18), 6.hours, st, rand(2) == 1
    makeshift date.change(:hour=>18), 6.hours, st, rand(2) == 1
    makeshift date.change(:hour=>21), 6.hours, st, rand(2) == 1
    makeshift date.change(:hour=>21), 6.hours, st, rand(2) == 1
    makeshift date.change(:hour=>23), 6.hours, st, rand(2) == 1
    makeshift date.change(:hour=>23), 6.hours, st, rand(2) == 1
    
    st = gs "Vakt"
    makeshift date.change(:hour=>18), 6.hours, st, rand(2) == 1
    makeshift date.change(:hour=>18), 6.hours, st, rand(2) == 1
    makeshift date.change(:hour=>23), 6.hours, st, rand(2) == 1
  end

  def randomuser
    offset = rand(User.count)
    User.first(:offset=>offset)
  end

  def makeshift(start, duration, shift_type, hasUser)
    shift = Shift.new
    shift.start = start
    shift.duration = duration
    shift.shift_type = shift_type

    if hasUser
      shift.user = randomuser
    end
    
    shift.save
  end
end
