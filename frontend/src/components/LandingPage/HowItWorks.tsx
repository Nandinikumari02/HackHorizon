import { ArrowRight} from "lucide-react"
import { Button } from "../ui/button"
import { Link } from "react-router-dom";

export const HowItWorks = () => {
    return(
        <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple 4-step process to report and resolve civic issues
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: '01',
                  title: 'Sign Up',
                  description: 'Create your free account in seconds using email or phone number.',
                  color: 'bg-primary'
                },
                {
                  step: '02',
                  title: 'Report Issue',
                  description: 'Take a photo, select category, and let GPS capture the location.',
                  color: 'bg-primary'
                },
                {
                  step: '03',
                  title: 'Track Progress',
                  description: 'Monitor real-time status updates as authorities work on your issue.',
                  color: 'bg-primary'
                },
                {
                  step: '04',
                  title: 'Issue Resolved',
                  description: 'Get notified when resolved and rate the service quality.',
                  color: 'bg-primary'
                }
              ].map((item, index) => (
                <div key={index} className="text-center relative">
                  <div className={`${item.color} text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4`}>
                    {item.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border " />
                  )}
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Start Reporting Now <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    )
}