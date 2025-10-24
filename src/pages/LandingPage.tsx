import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Zap, BarChart, BrainCircuit, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
const LandingPage = () => {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-papersense-accent" />,
      title: 'Instant OCR',
      description: 'Upload any document, and our powerful OCR will instantly extract the text for evaluation.',
    },
    {
      icon: <BrainCircuit className="h-8 w-8 text-papersense-accent" />,
      title: 'AI-Powered Evaluation',
      description: 'Leverage state-of-the-art AI to get objective scores, detailed feedback, and actionable insights.',
    },
    {
      icon: <BarChart className="h-8 w-8 text-papersense-accent" />,
      title: 'Performance Analytics',
      description: 'For teachers, visualize class performance with beautiful charts and track progress over time.',
    },
  ];
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  return (
    <div className="flex flex-col min-h-screen bg-papersense-secondary/30 dark:bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-papersense-primary" />
              <span className="text-2xl font-bold text-papersense-primary">PaperSense</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/auth">Log In</Link>
              </Button>
              <Button className="bg-papersense-primary hover:bg-papersense-primary/90" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-24 md:py-32 lg:py-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-papersense-primary leading-tight">
                Revolutionize Academic Evaluation with AI
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
                PaperSense provides instant, unbiased, and insightful feedback on academic papers, empowering both students and teachers to achieve excellence.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <Button size="lg" className="bg-papersense-accent hover:bg-papersense-accent/90 text-papersense-accent-foreground" asChild>
                  <Link to="/auth">
                    Start Evaluating Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ staggerChildren: 0.2 }}
            >
              <motion.h2 variants={fadeIn} className="text-3xl font-bold text-center text-papersense-primary">
                Why PaperSense?
              </motion.h2>
              <motion.p variants={fadeIn} className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
                Our platform is designed to be intuitive, powerful, and fair, providing tools that make a real difference in the educational journey.
              </motion.p>
              <div className="mt-12 grid gap-8 md:grid-cols-3">
                {features.map((feature, index) => (
                  <motion.div variants={fadeIn} key={index}>
                    <Card className="h-full text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                      <CardHeader>
                        <div className="mx-auto bg-papersense-accent/10 p-4 rounded-full w-fit">
                          {feature.icon}
                        </div>
                        <CardTitle className="mt-4">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="bg-background border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PaperSense. All rights reserved.</p>
          <p className="mt-1">Built with ❤️ at Cloudflare</p>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;