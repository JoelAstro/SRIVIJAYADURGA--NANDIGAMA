import React from 'react';
import { MapPin, Phone, MessageCircle, Map, ExternalLink } from 'lucide-react';

const ContactSection: React.FC = () => {
  const mapLink = "https://maps.app.goo.gl/qAypkmgzgzxfD6ND8?g_st=aw";
  const address = "Beside TTD Kalyana Mandapam, Vijaya talkies Road, Nandigama";

  return (
    <div className="w-full bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 rounded-3xl p-6 sm:p-10 shadow-lg relative glass overflow-hidden">
      
      {/* Decorative colored backdrop glow */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-maroon/5 rounded-full filter blur-xl"></div>
      <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-saffron/5 rounded-full filter blur-xl"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        
        {/* Info detail card */}
        <div className="space-y-6 flex flex-col justify-center">
          <div className="space-y-2">
            <h3 className="font-logo font-extrabold text-2xl text-maroon dark:text-saffron">Visit or Contact Us</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              We look forward to hosting you at Sri Vijaya Durga Restaurant. Reach out for home delivery, custom catering, or reservations.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Address */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-maroon/5 dark:bg-saffron/5 border border-maroon/20 dark:border-saffron/20 flex items-center justify-center text-maroon dark:text-saffron flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Address</h4>
                <p className="text-xs font-bold leading-relaxed">{address}</p>
              </div>
            </div>

            {/* Phone numbers */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-maroon/5 dark:bg-saffron/5 border border-maroon/20 dark:border-saffron/20 flex items-center justify-center text-maroon dark:text-saffron flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Phone Numbers</h4>
                <p className="text-xs font-bold">
                  <a href="tel:9966315544" className="hover:underline">Cell: 9966315544</a><br />
                  <a href="tel:9030121200" className="hover:underline">Phone: 9030121200</a>
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 flex-shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">WhatsApp chat</h4>
                <p className="text-xs font-bold">
                  <a 
                    href="https://wa.me/919030121200" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline text-green-600 dark:text-green-400"
                  >
                    Click to Chat (9030121200)
                  </a>
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Map Mock & location card */}
        <div className="h-64 sm:h-auto min-h-[260px] bg-neutral-100 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200 dark:border-neutral-700 relative overflow-hidden flex flex-col justify-end p-6 select-none shadow-inner">
          <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark to-transparent z-10"></div>
          
          <div className="relative z-20 space-y-4">
            <div className="space-y-1 text-white">
              <h4 className="font-logo font-extrabold text-lg flex items-center gap-1.5 text-saffron">
                <Map className="w-5 h-5" /> Google Maps Link
              </h4>
              <p className="text-xs opacity-80 max-w-sm">Tap below to open standard turn-by-turn driving directions in Google Maps.</p>
            </div>
            
            <a 
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-saffron text-maroon font-bold text-xs rounded-xl shadow-md"
            >
              Get Directions <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ContactSection;
