#  Copyright (c) 2008, Thomas L. Robinson
#  
#  All rights reserved.
#  
#  Redistribution and use in source and binary forms, with or without
#  modification, are permitted provided that the following conditions
#  are met:
#  
#  Redistributions of source code must retain the above copyright
#  notice, this list of conditions and the following disclaimer.
#  Redistributions in binary form must reproduce the above copyright
#  notice, this list of conditions and the following disclaimer in the
#  documentation and/or other materials provided with the distribution.
#  Neither the name of the tlrobinson.net nor the names of its contributors
#  may be used to endorse or promote products derived from this software
#  without specific prior written permission.
#  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
#  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
#  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
#  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
#  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
#  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
#  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
#  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
#  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
#  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
#  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
# 

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from socket import AF_INET, SOCK_DGRAM, socket
from urlparse import urlparse
from cgi import parse_qs
import simplejson
import netgrowl

class GrowlBridgeHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        try:
            # parse url
            u = urlparse(self.path)
            if u.path == "/":
                
                # parse query string
                q = parse_qs(u.query)
                print q
                
                # parse json payload
                j = simplejson.loads(q['d'][0])
                print j
                
                # create and send the notification
                p = netgrowl.GrowlNotificationPacket(
                    description=(j.has_key('description') and j['description'] or "Description"),
                    title=(j.has_key('title') and j['title'] or "Title"),
                    priority=(j.has_key('priority') and j['priority'] or 0),
                    sticky=True) #(j.has_key('sticky') and j['sticky'] or False))
                growlserver.sendto(p.payload(), addr)
                
                # send a 200 http response
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                return
            
            return
                
        except IOError:
            self.send_error(404, 'File Not Found: %s' % self.path)

def main():
    try:
        # prepare the growl socket
        global addr, growlserver
        addr = ("localhost", netgrowl.GROWL_UDP_PORT)
        growlserver = socket(AF_INET,SOCK_DGRAM)
        print "Assembling registration packet like growlnotify's (no password)"
        p = netgrowl.GrowlRegistrationPacket()
        p.addNotification()
        print "Sending registration packet"
        growlserver.sendto(p.payload(), addr)
        
        # start the http server
        httpserver = HTTPServer(('', 9889), GrowlBridgeHandler)
        print 'started growlbridge...'
        httpserver.serve_forever()
        
    except KeyboardInterrupt:
        print '^C received, shutting down server'
        httpserver.socket.close()
        
        growlserver.close()
        print "Done."

if __name__ == '__main__':
    main()

