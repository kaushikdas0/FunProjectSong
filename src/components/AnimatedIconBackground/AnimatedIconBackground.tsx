import { Icon } from '../Icon/Icon';

export function AnimatedIconBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* Top area */}
      <span className="absolute top-[4%] left-[8%] rotate-12 text-coral-500 animate-[icon-float_4s_ease-in-out_0s_infinite]"><Icon name="decorative" size={48} /></span>
      <span className="absolute top-[6%] left-[45%] -rotate-6 text-blue-400 animate-[icon-float_5s_ease-in-out_1.2s_infinite]"><Icon name="brand" size={24} /></span>
      <span className="absolute top-[10%] right-[10%] rotate-6 text-coral-500 animate-[icon-float_4.5s_ease-in-out_2.8s_infinite]"><Icon name="decorative" size={24} /></span>
      <span className="absolute top-[3%] right-[30%] -rotate-12 text-blue-400 animate-[icon-float_5.5s_ease-in-out_0.6s_infinite]"><Icon name="regenerate" size={24} /></span>
      {/* Upper-mid */}
      <span className="absolute top-[22%] left-[3%] rotate-45 text-blue-400 animate-[icon-float_6s_ease-in-out_3.5s_infinite]"><Icon name="brand" size={48} /></span>
      <span className="absolute top-[18%] right-[5%] -rotate-12 text-coral-500 animate-[icon-float_4s_ease-in-out_1.8s_infinite]"><Icon name="generate" size={24} /></span>
      <span className="absolute top-[28%] right-[25%] rotate-12 text-blue-300 animate-[icon-float_5s_ease-in-out_4.2s_infinite]"><Icon name="decorative" size={24} /></span>
      {/* Mid */}
      <span className="absolute top-[40%] left-[6%] -rotate-6 text-coral-500 animate-[icon-float_5.5s_ease-in-out_2.1s_infinite]"><Icon name="decorative" size={24} /></span>
      <span className="absolute top-[45%] right-[4%] rotate-6 text-blue-400 animate-[icon-float_4.5s_ease-in-out_0.3s_infinite]"><Icon name="brand" size={48} /></span>
      <span className="absolute top-[50%] left-[25%] rotate-12 text-blue-300 animate-[icon-float_6s_ease-in-out_3.0s_infinite]"><Icon name="regenerate" size={24} /></span>
      {/* Lower-mid */}
      <span className="absolute bottom-[30%] left-[4%] rotate-12 text-blue-400 animate-[icon-float_4s_ease-in-out_4.8s_infinite]"><Icon name="generate" size={24} /></span>
      <span className="absolute bottom-[35%] right-[12%] -rotate-6 text-coral-500 animate-[icon-float_5s_ease-in-out_1.5s_infinite]"><Icon name="decorative" size={24} /></span>
      <span className="absolute bottom-[28%] left-[40%] rotate-6 text-coral-400 animate-[icon-float_5.5s_ease-in-out_3.7s_infinite]"><Icon name="brand" size={24} /></span>
      {/* Bottom area */}
      <span className="absolute bottom-[15%] left-[12%] -rotate-12 text-coral-500 animate-[icon-float_4.5s_ease-in-out_0.9s_infinite]"><Icon name="decorative" size={48} /></span>
      <span className="absolute bottom-[10%] right-[15%] rotate-12 text-blue-400 animate-[icon-float_5s_ease-in-out_2.5s_infinite]"><Icon name="brand" size={24} /></span>
      <span className="absolute bottom-[5%] left-[35%] -rotate-6 text-coral-500 animate-[icon-float_6s_ease-in-out_4.0s_infinite]"><Icon name="decorative" size={48} /></span>
      <span className="absolute bottom-[8%] right-[35%] rotate-45 text-blue-300 animate-[icon-float_4s_ease-in-out_1.0s_infinite]"><Icon name="regenerate" size={24} /></span>
      <span className="absolute bottom-[2%] left-[60%] rotate-6 text-coral-400 animate-[icon-float_5.5s_ease-in-out_2.3s_infinite]"><Icon name="generate" size={24} /></span>
    </div>
  );
}
