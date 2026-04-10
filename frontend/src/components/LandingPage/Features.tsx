
import { Card, CardContent } from "../ui/card"
import { Bell, FileText, MapPin, MessageSquare, Shield, Smartphone } from "lucide-react"

export const Features = () => {
    return(
        <section id="features" className="py-20 ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to report, track, and resolve civic issues efficiently
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-secondary">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Reporting</h3>
                <p className="text-muted-foreground">
                  Report issues instantly with photo uploads and automatic GPS location capture. 
                  No complicated forms, just quick submissions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-secondary">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Live Tracking</h3>
                <p className="text-muted-foreground">
                  Track your reported issues in real-time. Get updates at every stage 
                  from submission to resolution.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-secondary">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Notifications</h3>
                <p className="text-muted-foreground">
                  Receive instant updates via push notifications and email when your 
                  issue status changes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-secondary">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community Support</h3>
                <p className="text-muted-foreground">
                  Upvote issues reported by others to prioritize critical problems. 
                  Together, we make a stronger impact.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-secondary">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Detailed Reports</h3>
                <p className="text-muted-foreground">
                  Access comprehensive reports and analytics on civic issues 
                  in your area and city-wide trends.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-secondary">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Rewards System</h3>
                <p className="text-muted-foreground">
                  Earn civic points for reporting issues and contributing to your 
                  community. Redeem rewards and badges.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    )
}