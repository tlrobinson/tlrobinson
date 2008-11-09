require 'open-uri'
require 'hpricot'
require 'base64'

def bmn_decode(input, offset)
  # decode base64, strip first 4 chars, convert chars to ints, substract offset, convert back ints back to chars
  input.unpack("m*")[0][4..-1].unpack("C*").map{|c| c - offset }.pack("C*")
end

def bmn_lookup(site)
  doc = Hpricot(open('http://www.bugmenot.com/view/' + CGI.escape(site)))

  key = ((doc/"head"/"script")[1]).inner_text[/\d+/].to_i
  offset = (key + 112) / 12

  best_percent = -1
  result = nil

  (doc/".account"/"table").each do |tbody|
    username  = ((tbody/"tr")[0]/"td"/"script").text[/d\('(.*)'\);/, 1]
    password  = ((tbody/"tr")[1]/"td"/"script").text[/d\('(.*)'\);/, 1]
    percent  = ((tbody/"tr")[3]/"td"/"em").text[/\d+/].to_i
  
    if percent > best_percent
      best_percent = percent
      result = {
        :username => bmn_decode(username, offset),
        :password => bmn_decode(password, offset)
      }
    end
  end  

  result
end
