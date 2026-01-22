import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { 
    ShieldCheckIcon, 
    ClockIcon, 
    CurrencyDollarIcon, 
    RocketLaunchIcon, 
    UserGroupIcon, 
    ScaleIcon,
    ArrowRightIcon,
    StarIcon,
    EyeIcon,
    HeartIcon,
    SparklesIcon,
    CheckCircleIcon,
    PlayIcon
} from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';

const Homepage = () => {
    const { isAuthenticated } = useAuth();
    const [featuredItems, setFeaturedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFeature, setActiveFeature] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        // Fetch featured items
        const fetchFeatured = async () => {
            try {
                const { data } = await api.get('/bidding-rooms?limit=8');
                console.log('Featured items response:', data);
                const items = data.products || data || [];
                setFeaturedItems(items);
                setDebugInfo(`Loaded ${items.length} items from API`);
            } catch (error) {
                console.error("Could not fetch featured items:", error);
                setFeaturedItems([]);
                setDebugInfo(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();

        // Trigger animations on scroll
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const sections = document.querySelectorAll('.animate-on-scroll');
        sections.forEach(section => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    // Auto-rotate features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: <UserGroupIcon className="h-8 w-8 text-primary" />,
            title: "Create an Account",
            description: "Sign up for free and load your wallet to get ready for the action.",
            color: "from-blue-500 to-purple-600"
        },
        {
            icon: <RocketLaunchIcon className="h-8 w-8 text-primary" />,
            title: "Find & Place Bids",
            description: "Explore live auctions, find items you love, and place your bids in real-time.",
            color: "from-purple-500 to-pink-600"
        },
        {
            icon: <CurrencyDollarIcon className="h-8 w-8 text-primary" />,
            title: "Win & Enjoy",
            description: "Stay on top! If you're the highest bidder when the timer ends, the item is yours.",
            color: "from-pink-500 to-red-600"
        }
    ];

    const stats = [
        { number: "10K+", label: "Active Users" },
        { number: "50K+", label: "Items Sold" },
        { number: "99%", label: "Satisfaction Rate" },
        { number: "24/7", label: "Support" }
    ];

    const FeatureCard = ({ icon, title, description, isActive, index }) => (
        <div 
            className={`relative p-8 rounded-2xl transition-all duration-500 transform ${
                isActive 
                    ? 'scale-105 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 shadow-xl' 
                    : 'scale-100 bg-white border border-gray-200 shadow-lg hover:shadow-xl'
            }`}
            onClick={() => setActiveFeature(index)}
        >
            <div className={`flex items-center justify-center h-16 w-16 rounded-full mx-auto mb-6 transition-all duration-300 ${
                isActive ? 'bg-gradient-to-br from-primary to-primary-dark shadow-lg' : 'bg-primary/10'
            }`}>
                <div className={isActive ? 'text-white' : 'text-primary'}>
                    {icon}
                </div>
            </div>
            <h3 className={`text-xl font-bold text-center mb-4 transition-colors duration-300 ${
                isActive ? 'text-primary' : 'text-neutral-darkest'
            }`}>
                {title}
            </h3>
            <p className={`text-center transition-colors duration-300 ${
                isActive ? 'text-primary-dark' : 'text-neutral-dark'
            }`}>
                {description}
            </p>
            {isActive && (
                <div className="absolute -top-2 -right-2">
                    <SparklesIcon className="h-6 w-6 text-yellow-500 animate-pulse" />
                </div>
            )}
        </div>
    );

    const StatCard = ({ number, label }) => (
        <div className="text-center group">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                {number}
            </div>
            <div className="text-neutral-dark font-medium">{label}</div>
        </div>
    );

    return (
        <div className="bg-white overflow-hidden">
            {/* Hero Section with Parallax */}
            <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-darkest via-neutral-dark to-neutral-darkest">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-bounce"></div>
                        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-spin"></div>
                    </div>
                </div>

                <div className="relative container mx-auto px-4 text-center text-white z-10">
                    <div className="animate-on-scroll opacity-0 animate-fade-in-up">
                        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
                            <StarIcon className="h-5 w-5 text-yellow-400 mr-2" />
                            <span className="text-sm font-medium">Trusted by 10,000+ users worldwide</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                            The Thrill of the
                            <span className="block bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                                Bid Awaits
                            </span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-neutral-light max-w-3xl mx-auto mb-10 leading-relaxed">
                            Discover unique collectibles, rare items, and exclusive deals. 
                            Your next great find is just a bid away in our real-time auction platform.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {isAuthenticated ? (
                                <Link 
                                    to="/auctions" 
                                    className="group px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white text-lg font-bold rounded-full shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                                >
                                    Start Exploring
                                    <ArrowRightIcon className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <>
                                    <Link 
                                        to="/login" 
                                        className="group px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white text-lg font-bold rounded-full shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                                    >
                                        Login to Start Bidding
                                        <ArrowRightIcon className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                                    >
                                        Sign Up Free
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <StatCard key={index} {...stat} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* Featured Auctions Section */}
            <section className="py-20 bg-gradient-to-br from-neutral-lightest to-white animate-on-scroll">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-darkest mb-4">
                            Featured Auctions
                        </h2>
                        <p className="text-xl text-neutral-dark max-w-2xl mx-auto">
                            Discover trending items and exclusive deals from our community
                        </p>
                    </div>
                    
                    {loading ? (
                        <div className="text-center">
                            <div className="animate-pulse">
                                <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-8"></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-lg shadow-lg p-6">
                                            <div className="h-48 bg-gray-300 rounded mb-4"></div>
                                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                         {featuredItems.length > 0 ? (
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                 {featuredItems.map((item, index) => (
                                     <div 
                                         key={item._id} 
                                         className="transform hover:scale-105 transition-all duration-300"
                                         style={{ animationDelay: `${index * 100}ms` }}
                                     >
                                         <ProductCard room={item} />
                                     </div>
                                 ))}
                             </div>
                         ) : (
                             <div className="text-center py-12">
                                 <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-12 max-w-2xl mx-auto shadow-xl">
                                     <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                         <EyeIcon className="h-10 w-10 text-white" />
                                     </div>
                                     <h3 className="text-2xl font-bold text-gray-800 mb-4">No Auctions Available</h3>
                                     <p className="text-gray-600 mb-6 text-lg">
                                         There are currently no active auctions. Check back soon for new items!
                                     </p>
                                     <div className="text-sm text-gray-500">
                                         Debug info: {debugInfo}
                                     </div>
                                 </div>
                             </div>
                         )}
                         
                         {!isAuthenticated && (
                             <div className="text-center mt-12">
                                 <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-xl">
                                     <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                         <EyeIcon className="h-8 w-8 text-white" />
                                     </div>
                                     <h3 className="text-xl font-bold text-blue-800 mb-3">Want to Participate?</h3>
                                     <p className="text-blue-700 mb-6">
                                         Join our community to place bids and win amazing items!
                                     </p>
                                     <Link 
                                         to="/login" 
                                         className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                     >
                                         Login to Start Bidding
                                         <ArrowRightIcon className="ml-2 h-4 w-4" />
                                     </Link>
                                 </div>
                             </div>
                         )}
                         
                         {isAuthenticated && (
                             <div className="text-center mt-12">
                                 <Link 
                                     to="/auctions" 
                                     className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-full shadow-xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
                                 >
                                     View All Auctions
                                     <ArrowRightIcon className="ml-2 h-5 w-5" />
                                 </Link>
                             </div>
                         )}
                        </>
                    )}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white animate-on-scroll">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-darkest mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-neutral-dark max-w-2xl mx-auto">
                            Get started in just a few simple steps. It's easier than you think!
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard 
                                key={index}
                                {...feature}
                                isActive={activeFeature === index}
                                index={index}
                            />
                        ))}
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex justify-center mt-12">
                        <div className="flex space-x-2">
                            {features.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveFeature(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        activeFeature === index 
                                            ? 'bg-primary scale-125' 
                                            : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Why Choose Us Section */}
            <section className="py-20 bg-gradient-to-br from-neutral-lightest to-white animate-on-scroll">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-darkest mb-4">
                            Why Choose Bidding Bazar?
                        </h2>
                        <p className="text-xl text-neutral-dark max-w-2xl mx-auto">
                            We're not just another auction site. We're your trusted partner in finding amazing deals.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="group text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <ShieldCheckIcon className="h-10 w-10 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-neutral-darkest mb-4">Secure Transactions</h4>
                            <p className="text-neutral-dark leading-relaxed">
                                Your payments and personal data are protected with industry-standard security protocols.
                            </p>
                        </div>
                        
                        <div className="group text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <ScaleIcon className="h-10 w-10 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-neutral-darkest mb-4">Fair & Transparent</h4>
                            <p className="text-neutral-dark leading-relaxed">
                                See the full bid history. No hidden bids, no surprise price jumps. Complete transparency.
                            </p>
                        </div>
                        
                        <div className="group text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <ClockIcon className="h-10 w-10 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-neutral-darkest mb-4">Real-Time Action</h4>
                            <p className="text-neutral-dark leading-relaxed">
                                Our live notification system ensures you never miss a critical outbid moment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            {!isAuthenticated && (
                <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white animate-on-scroll">
                    <div className="container mx-auto px-4 text-center">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Ready to Join the Action?
                            </h2>
                            <p className="text-xl mb-8 text-white/90">
                                Create your account today and discover a world of amazing auctions. 
                                Your next treasure is waiting!
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link 
                                    to="/register" 
                                    className="group px-8 py-4 bg-white text-primary text-lg font-bold rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                                >
                                    Sign Up for Free
                                    <ArrowRightIcon className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link 
                                    to="/login" 
                                    className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                                >
                                    Already have an account? Login
                                </Link>
                            </div>
                            
                            <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                    <span>No hidden fees</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                    <span>Instant access</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                    <span>24/7 support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Floating Action Button for Mobile */}
            <div className="fixed bottom-6 right-6 z-50 md:hidden">
                <Link 
                    to={isAuthenticated ? "/auctions" : "/login"}
                    className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-110 animate-pulse-glow"
                >
                    <RocketLaunchIcon className="h-6 w-6" />
                </Link>
            </div>

            {/* Back to Top Button */}
            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-white/80 backdrop-blur-sm text-primary rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border border-gray-200"
            >
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>

            {/* Footer */}
            <footer className="bg-neutral-darkest text-white py-12 animate-on-scroll">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-2xl font-bold text-primary mb-4">Bidding Bazar</h3>
                            <p className="text-neutral-light mb-6 max-w-md">
                                Your trusted platform for real-time online auctions. Discover unique items, 
                                place bids, and win amazing deals in a secure and transparent environment.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-neutral-light hover:text-primary transition-colors duration-300">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-neutral-light hover:text-primary transition-colors duration-300">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-neutral-light hover:text-primary transition-colors duration-300">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/auctions" className="text-neutral-light hover:text-primary transition-colors duration-300">
                                        Browse Auctions
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/create-listing" className="text-neutral-light hover:text-primary transition-colors duration-300">
                                        Create Listing
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/profile" className="text-neutral-light hover:text-primary transition-colors duration-300">
                                        My Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/wallet" className="text-neutral-light hover:text-primary transition-colors duration-300">
                                        Wallet
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Support</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-neutral-light hover:text-primary transition-colors duration-300">
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-neutral-light hover:text-primary transition-colors duration-300">
                                        Contact Us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-neutral-light hover:text-primary transition-colors duration-300">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-neutral-light hover:text-primary transition-colors duration-300">
                                        Terms of Service
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="border-t border-neutral-dark mt-8 pt-8 text-center">
                        <p className="text-neutral-light">
                            © {new Date().getFullYear()} Bidding Bazar. All rights reserved to{' '}
                            <span className="text-primary font-semibold">Kushal Khanal</span>.
                        </p>
                        <p className="text-sm text-neutral-dark mt-2">
                            Made with ❤️ for the auction community
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;