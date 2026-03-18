import React from 'react';
import { Shield, Clock, DollarSign, Users, Layers, MessageSquare, Zap, Camera, Video, Palette, Image, MonitorPlay, FileText, CheckCircle, ArrowRight, Globe, Award, Lock, Cpu, Handshake, TrendingUp, Star } from 'lucide-react';

export const Proposal: React.FC = () => {
  return (
    <div className="min-h-screen bg-salmon selection:bg-black selection:text-white">

      {/* Confidentiality Banner */}
      <div className="bg-black text-white py-3 px-4 text-center">
        <p className="text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2">
          <Lock className="w-3 h-3" />
          Confidential &mdash; For Recipient&apos;s Review Only
          <Lock className="w-3 h-3" />
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">

        {/* Hero / Title */}
        <section className="text-center space-y-6">
          <h1 className="text-7xl md:text-9xl font-display text-white text-stroke tracking-tighter transform -rotate-1">
            ✦ free
          </h1>
          <p className="text-xl md:text-2xl font-bold text-black max-w-2xl mx-auto leading-relaxed">
            AI-Powered Visual Content Generation for Modern Brands
          </p>
          <div className="inline-flex items-center gap-2 bg-white neo-border neo-shadow px-6 py-3">
            <Globe className="w-4 h-4" />
            <span className="font-bold text-sm uppercase tracking-wider">Partnership Proposal</span>
          </div>
        </section>

        {/* Confidentiality Notice */}
        <section className="bg-white neo-border neo-shadow-lg p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-black flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-display text-xl uppercase tracking-wide mb-3">Confidentiality Notice</h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                This page contains sensitive information intended solely for the recipient's review and feedback. The contents of this page are confidential and may not be reproduced, shared, or disclosed, in whole or in part, without the express written permission of ✦ free. The recipient agrees to take reasonable precautions to prevent unauthorized access, copying, or disclosure of the information.
              </p>
            </div>
          </div>
        </section>

        {/* Who We Are */}
        <section className="space-y-8">
          <div className="bg-black text-white neo-border p-2 inline-block transform -rotate-1">
            <h2 className="font-display text-2xl uppercase tracking-wider px-4 py-2">Who We Are</h2>
          </div>

          <div className="bg-white neo-border neo-shadow-lg p-8 space-y-6">
            <h3 className="font-display text-3xl uppercase tracking-tight leading-tight">
              Generate, Scale & Deploy Visual Content Better with ✦ free
            </h3>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p className="text-lg font-bold text-black">
                ✦ free is an AI-native visual content platform that transforms how brands create imagery &mdash; unifying generation, editing, and deployment into a single intelligent workflow powered by cutting-edge AI models.
              </p>

              <p>
                Generate stunning photorealistic visual assets for all your eCommerce, marketing, and brand requirements through AI, without the hassle and challenges associated with traditional photoshoots.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                <div className="bg-gray-50 neo-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase">No Photoshoots</span>
                  </div>
                  <p className="text-sm text-gray-600">Turn simple flatlays or phone shots into print-ready assets using AI.</p>
                </div>
                <div className="bg-gray-50 neo-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase">Consistent & Scalable</span>
                  </div>
                  <p className="text-sm text-gray-600">Ensure consistent, scalable content across formats and styles.</p>
                </div>
                <div className="bg-gray-50 neo-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase">Managed Service</span>
                  </div>
                  <p className="text-sm text-gray-600">Receive a fully managed service with us as your extended creative team.</p>
                </div>
              </div>
            </div>

            {/* Backing / Credibility */}
            <div className="bg-black text-white neo-border p-6 transform rotate-[0.5deg]">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-6 h-6" />
                <h4 className="font-display text-lg uppercase">Built on Proven AI Infrastructure</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Powered by state-of-the-art generative AI models and backed by years of deep tech expertise, ✦ free delivers the ultimate fusion of AI and visual content creation. Our team brings decades of combined experience across AI research, computer vision, and e-commerce content production to deliver results that push the boundary of what's possible with AI-generated imagery.
              </p>
            </div>
          </div>
        </section>

        {/* What's Broken */}
        <section className="space-y-8">
          <div className="bg-black text-white neo-border p-2 inline-block transform rotate-1">
            <h2 className="font-display text-2xl uppercase tracking-wider px-4 py-2">What's Broken Today?</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Clock, title: "Weeks of Delay", desc: "Traditional shoots take weeks from planning to delivery" },
              { icon: Layers, title: "Visuals Siloed by Format", desc: "Different assets require different workflows and tools" },
              { icon: DollarSign, title: "High Costs", desc: "Studio shoots, models, photographers, and retouching add up" },
              { icon: Users, title: "Fragmented Vendors", desc: "Multiple agencies for different content types" },
              { icon: Palette, title: "Multiple Teams for Pillars", desc: "Separate teams for photos, videos, social, and ads" },
              { icon: MessageSquare, title: "Slow Feedback Loops", desc: "Endless back-and-forth with long revision cycles" },
            ].map((item, idx) => (
              <div key={idx} className="bg-white neo-border neo-shadow p-5 hover:-translate-y-1 transition-transform">
                <item.icon className="w-8 h-8 mb-3 text-red-500" />
                <h3 className="font-bold text-sm uppercase mb-1">{item.title}</h3>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Work With Us */}
        <section className="space-y-8">
          <div className="bg-black text-white neo-border p-2 inline-block transform -rotate-1">
            <h2 className="font-display text-2xl uppercase tracking-wider px-4 py-2">Why Work With Us?</h2>
          </div>

          <div className="bg-white neo-border neo-shadow-lg p-8">
            <p className="text-lg font-bold text-black mb-6">
              We become your AI-native creative stack, delivering content across every use case & format.
              Don't think of us as just your AI partner. Think of us as your own extended Photo Studio.
            </p>

            <div className="space-y-6">
              {/* Content Trilemma */}
              <div className="bg-gray-50 neo-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6" />
                  <h3 className="font-display text-lg uppercase">Solving the Content Trilemma</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Content is limited by the AI-trilemma. Most solutions can only offer 1 or 2 of the 3 parameters: <strong>Cost, Accuracy & Turnaround Time</strong>.
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  At ✦ free, based on your priorities, we optimize this triangle to give you the best of all 3 worlds: We help you generate <strong>highly accurate photorealistic assets</strong> in <strong>ultra fast turnaround times</strong> at a <strong>very affordable cost</strong>.
                </p>
                <div className="flex gap-4 mt-4">
                  {["Cost", "Accuracy", "Speed"].map((label) => (
                    <div key={label} className="flex-1 bg-black text-white text-center py-2 neo-border border-white">
                      <span className="font-bold text-xs uppercase">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech-First */}
              <div className="bg-gray-50 neo-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Cpu className="w-6 h-6" />
                  <h3 className="font-display text-lg uppercase">Tech-First Approach</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  ✦ free is not just another agency or a group of developers using open models to generate images and videos. It is a technology platform with deep expertise in generative AI, computer vision, and image synthesis. We build and fine-tune proprietary pipelines to deliver results that off-the-shelf tools simply cannot match.
                </p>
              </div>

              {/* AI Partnerships */}
              <div className="bg-gray-50 neo-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Handshake className="w-6 h-6" />
                  <h3 className="font-display text-lg uppercase">Exclusive AI Partnerships</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  ✦ free collaborates directly with leading AI model providers, bringing cutting-edge AI capabilities to our clients &mdash; tools and models that are not available to everyone.
                </p>
              </div>

              {/* Long-Term */}
              <div className="bg-gray-50 neo-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-6 h-6" />
                  <h3 className="font-display text-lg uppercase">Prioritizing Long-Term Relationships</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  We are committed to supporting sustainable growth. AI image generation requires costly GPU infrastructure and dedicated AI operations teams to achieve the polish that AI alone cannot provide. We invest deeply to ensure our clients have a reliable, long-term partner.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Scope */}
        <section className="space-y-8">
          <div className="bg-black text-white neo-border p-2 inline-block transform rotate-[0.5deg]">
            <h2 className="font-display text-2xl uppercase tracking-wider px-4 py-2">Partnership Scope</h2>
          </div>

          <div className="bg-white neo-border neo-shadow-lg p-8 space-y-8">
            <p className="text-gray-700 leading-relaxed">
              We will generate high-quality AI content tailored to the following use cases:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Image, title: "Catalog Images", desc: "Product-focused imagery featuring studio backgrounds with standardized views such as front, back, side, and detail shots." },
                { icon: Camera, title: "Lifestyle Images", desc: "Product-focused imagery featuring lifestyle backgrounds that showcase products in contextual situations and backgrounds." },
                { icon: Video, title: "Product Catalog Videos", desc: "Short-form, AI-generated videos optimized for e-commerce. (10-15 Seconds)" },
                { icon: MonitorPlay, title: "Marketing Reels & Videos", desc: "Scroll-stopping video featuring the product in real-life moments, perfect for social media storytelling and ads." },
                { icon: Palette, title: "Monthly Social Media Pack", desc: "A complete suite of social-first content tailored for multiple platforms, including static posts, reels, stories, and carousels. Designed to maintain daily visibility and engagement." },
                { icon: FileText, title: "Ad Films", desc: "Commercial videos created to promote products, services, or brands through engaging storytelling and compelling visuals, from 15 seconds to a few minutes." },
                { icon: Cpu, title: "CGI Videos", desc: "Videos using Computer-Generated Imagery to create digitally rendered scenes, characters, or environments &mdash; from full animations to enhanced footage with visual effects." },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-gray-50 neo-border hover:bg-gray-100 transition-colors">
                  <item.icon className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-sm uppercase mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Scope */}
            <div className="bg-black text-white neo-border p-6">
              <h3 className="font-display text-lg uppercase mb-4">Delivery Scope</h3>
              <ul className="space-y-3">
                {[
                  "Images can be delivered up to 4K HD resolution, and can be designed to be placed on physical billboards based on request.",
                  "A dedicated creative team will partner with your brand to ideate, align, and deliver on your vision.",
                  "All content will be checked by a dedicated QA team prior to delivery to ensure all brand standards & guidelines are followed & enforced.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Supported Inputs */}
            <div className="bg-gray-50 neo-border p-6">
              <h3 className="font-display text-lg uppercase mb-3">Supported Input Types</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <ArrowRight className="w-4 h-4" />
                  Flat-lay garment images or Mannequin
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <ArrowRight className="w-4 h-4" />
                  Non-compressed phone-shot images (eliminating the need for studio shoots, DSLRs and studio lighting set-ups)
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Commercial Models */}
        <section className="space-y-8">
          <div className="bg-black text-white neo-border p-2 inline-block transform -rotate-1">
            <h2 className="font-display text-2xl uppercase tracking-wider px-4 py-2">Commercial Models</h2>
          </div>

          {/* Credit-Based Retainer */}
          <div className="bg-white neo-border neo-shadow-lg p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Handshake className="w-6 h-6" />
              <h3 className="font-display text-xl uppercase">Credit Based Retainer</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Consistent, cost-optimized production",
                "48-72 hours delivery time",
                "Dedicated Team & GPU Resources",
                "Best ROI & TAT",
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 neo-border p-3 text-center">
                  <CheckCircle className="w-5 h-5 mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase">{item}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 italic">This is a yearly commitment contract.</p>

            {/* Pricing Table */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <h4 className="font-display text-lg uppercase">Credit Based Pricing</h4>
              </div>
              <p className="text-sm text-gray-700">Cost of 1 credit: <strong>$0.10 /credit</strong></p>
              <p className="text-xs text-gray-500">Note: Invoice for the credits are raised at the start of the month in case of monthly payments.</p>

              {/* Main Pricing Table */}
              <div className="overflow-x-auto">
                <table className="w-full neo-border text-sm">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="p-3 text-left font-bold uppercase text-xs">Credits / Month</th>
                      <th className="p-3 text-left font-bold uppercase text-xs">Monthly</th>
                      <th className="p-3 text-left font-bold uppercase text-xs">Quarterly (10% Off)</th>
                      <th className="p-3 text-left font-bold uppercase text-xs">Half Yearly (25% Off)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b-2 border-black">
                      <td className="p-3 font-bold">15,000 Credits</td>
                      <td className="p-3">$1,500</td>
                      <td className="p-3">$4,050 <span className="text-xs text-gray-500">($1,350/mo)</span></td>
                      <td className="p-3">$6,750 <span className="text-xs text-gray-500">($1,125/mo)</span></td>
                    </tr>
                    <tr className="border-b-2 border-black">
                      <td className="p-3 font-bold">20,000 Credits</td>
                      <td className="p-3">$2,000</td>
                      <td className="p-3">$5,400 <span className="text-xs text-gray-500">($1,800/mo)</span></td>
                      <td className="p-3">$9,000 <span className="text-xs text-gray-500">($1,500/mo)</span></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 font-bold">Cost / Credit</td>
                      <td className="p-3">$0.10</td>
                      <td className="p-3">$0.09</td>
                      <td className="p-3">$0.075</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Consumption Estimate */}
            <div className="bg-gray-50 neo-border p-6 space-y-4">
              <h4 className="font-display text-lg uppercase">Estimated Consumption</h4>
              <p className="text-sm text-gray-600">Approx. Per Month: <strong>15,000 Credits</strong> &middot; Approx. Per Year: <strong>180,000 Credits</strong></p>

              <table className="w-full neo-border text-sm">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="p-3 text-left font-bold uppercase text-xs">Deliverables</th>
                    <th className="p-3 text-left font-bold uppercase text-xs">Monthly Credits</th>
                    <th className="p-3 text-left font-bold uppercase text-xs">Monthly Cost (Base)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b-2 border-black">
                    <td className="p-3">20 Catalog + Video Packs</td>
                    <td className="p-3">4,800</td>
                    <td className="p-3">$480</td>
                  </tr>
                  <tr className="border-b-2 border-black">
                    <td className="p-3">10 Marketing Reels</td>
                    <td className="p-3">10,000</td>
                    <td className="p-3">$1,000</td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="p-3">Total</td>
                    <td className="p-3">14,800</td>
                    <td className="p-3">$1,480</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Per Asset Credit Table */}
            <div className="space-y-4">
              <h4 className="font-display text-lg uppercase">Per Asset Credit Consumption</h4>
              <div className="overflow-x-auto">
                <table className="w-full neo-border text-sm">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="p-3 text-left font-bold uppercase text-xs">Deliverable</th>
                      <th className="p-3 text-left font-bold uppercase text-xs">Credits Required</th>
                      <th className="p-3 text-left font-bold uppercase text-xs">Approx. Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Catalog Pack (7 images)", credits: "120 Credits", price: "$10.80" },
                      { name: "Catalog + Video Pack (7 images + 1 Video)", credits: "240 Credits", price: "$21.60", bold: true },
                      { name: "Catalog / Lifestyle Images", credits: "20 Credits", price: "$1.80" },
                      { name: "Catalog Videos (under 15 secs)", credits: "120 Credits", price: "$10.80", bold: true },
                      { name: "Meta/Google Ad Creatives", credits: "25 Credits", price: "$2.25" },
                      { name: "Social Media Creatives", credits: "25 Credits", price: "$2.25" },
                      { name: "Print Ad Creatives", credits: "50 Credits", price: "$4.50" },
                      { name: "Marketing Reels & Videos (25-30 Sec)", credits: "1,000 Credits", price: "$90.00", bold: true },
                      { name: "Ad Films (1 min+)", credits: "Custom", price: "Custom" },
                      { name: "CGI Videos", credits: "Custom", price: "Custom" },
                    ].map((item, idx) => (
                      <tr key={idx} className={`border-b border-gray-200 ${item.bold ? 'bg-gray-50 font-bold' : ''}`}>
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.credits}</td>
                        <td className="p-3">{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Engagement Structure */}
        <section className="space-y-8">
          <div className="bg-black text-white neo-border p-2 inline-block transform rotate-[0.5deg]">
            <h2 className="font-display text-2xl uppercase tracking-wider px-4 py-2">Engagement Structure</h2>
          </div>

          <div className="bg-white neo-border neo-shadow-lg p-8">
            <div className="space-y-0">
              {[
                { step: "Step 1", desc: "We request Brand to confirm input details at least 1 week beforehand. Preferably, a monthly plan should be provided indicating the batches, number of SKUs, and corresponding dates." },
                { step: "Step 2", desc: "✦ free will review and confirm within 24 hours whether the input is good to proceed or requires revisions." },
                { step: "Step 3", desc: "Initial output will be generated within 48\u201372 hours." },
                { step: "Step 4", desc: "Brand to provide confirmation and feedback within the next 24 hours." },
                { step: "Step 5", desc: "Final output with revisions will be delivered within 24 hours." },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 py-5 border-b-2 border-gray-100 last:border-b-0">
                  <div className="bg-black text-white font-display text-sm uppercase px-3 py-1 flex-shrink-0 neo-border border-white">
                    {item.step}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Terms & Conditions */}
        <section className="space-y-8">
          <div className="bg-black text-white neo-border p-2 inline-block transform -rotate-[0.5deg]">
            <h2 className="font-display text-2xl uppercase tracking-wider px-4 py-2">Terms & Conditions</h2>
          </div>

          <div className="bg-white neo-border neo-shadow-lg p-8">
            <ol className="space-y-4">
              {[
                { title: "Taxes", desc: "All prices mentioned are exclusive of taxes. Any applicable taxes shall be added during invoicing." },
                { title: "Termination", desc: "This is a 12-month fixed-term agreement. Either party may terminate this contract only for cause, with a minimum of 30 days\u2019 written notice. In the event of termination without cause, the Client shall remain liable for the full fees applicable for the entire contract term, with no refunds on amounts already paid." },
                { title: "Input Images & QC", desc: "All input images and SKUs must comply with the ✦ free requirements document and pass basic QC (clear, uncut, unwrinkled, and not blurred)." },
                { title: "Variations", desc: "A defined number of variations per SKU, per model, and per background will be agreed in advance." },
                { title: "Payment Terms", desc: "Payments to be cleared within 15 days of invoice." },
                { title: "Feedback Cycle", desc: "Consolidated feedback to be shared within 48-72 hours of output submission." },
                { title: "Iteration Cycle", desc: "For each asset generated, up to 2 rounds of revisions will be included, provided the storyboard and creative direction have been reviewed and approved prior to generation. Any changes requested beyond the approved storyboard or after the two included revision rounds may be subject to additional costs and revised timelines." },
                { title: "Scope Alignment", desc: "Any new requirement outside of corrections will be considered additional scope and charged separately." },
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                  <span className="bg-black text-white w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm uppercase mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Footer / Sign-off */}
        <section className="text-center space-y-6 pb-12">
          <div className="bg-white neo-border neo-shadow-lg p-8 inline-block">
            <p className="font-display text-xl uppercase tracking-wider mb-2">Best Regards,</p>
            <p className="text-3xl font-display">Team ✦ free</p>
          </div>
        </section>

      </div>
    </div>
  );
};
