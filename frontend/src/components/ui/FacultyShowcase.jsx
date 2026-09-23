import { useState } from 'react';
import { FaLinkedinIn, FaTwitter, FaBehance, FaInstagram } from 'react-icons/fa';
import { cn } from '../../lib/utils';

const DEFAULT_MEMBERS = [
  { id: '1', name: 'Dr. E. ILAVARASAN', role: 'Faculty Coordinator', image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png', social: {} },
  { id: '2', name: 'Dr. R. Manoharan', role: 'Faculty Coordinator', image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png', social: {} },
  { id: '3', name: 'Dr. M. Thenmozhi', role: 'Faculty Coordinator', image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png', social: {} },
  { id: '4', name: 'Dr. (Mrs.) Salini P', role: 'Faculty Coordinator', image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png', social: {} },
];

export default function FacultyShowcase({ members = DEFAULT_MEMBERS }) {
  const [hoveredId, setHoveredId] = useState(null);

  const activeMember = hoveredId ? members.find(m => m.id === hoveredId) : null;

  const col1 = members.filter((_, i) => i % 2 === 0);
  const col2 = members.filter((_, i) => i % 2 === 1);

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 md:gap-10 lg:gap-14 select-none w-full max-w-5xl mx-auto py-8 px-4 md:px-6 font-sans relative">

      {/* Mobile Full Screen Overlay */}
      {activeMember && (
        <div
          className="fixed inset-0 z-[200] flex md:hidden items-center justify-center p-6 bg-black/60 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setHoveredId(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-full max-w-sm flex flex-col items-center shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button className="absolute top-4 right-4 text-gray-500 hover:text-black z-10 bg-white/50 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center" onClick={() => setHoveredId(null)}>
              ✕
            </button>
            <img src={activeMember.image} alt={activeMember.name} className="w-full h-auto max-h-[55vh] object-cover object-bottom block rounded-t-2xl" />
            <div className="p-6 flex flex-col items-center w-full">
              <h3 className="text-2xl font-bold text-gray-900 text-center">{activeMember.name}</h3>
              <p className="text-sm font-medium text-gray-500 mt-2 mb-6 uppercase tracking-wider">{activeMember.role}</p>
              {activeMember.social?.linkedin && (
                <a
                  href={activeMember.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#0A66C2] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#004182] transition-colors"
                >
                  <FaLinkedinIn size={18} />
                  Connect on LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Left: photo grid ── */}
      <div className="flex gap-2 md:gap-3 flex-shrink-0 justify-center w-full md:w-auto">
        {/* Placeholder Column to align with TeamShowcase */}
        <div className="hidden md:block w-[155px] flex-shrink-0"></div>

        {/* Column 1 */}
        <div className="flex flex-col gap-2 md:gap-3">
          {col1.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[28vw] h-[30vw] sm:w-[130px] sm:h-[140px] md:w-[155px] md:h-[165px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-2 md:gap-3 mt-[48px] sm:mt-[56px] md:mt-[68px]">
          {col2.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[30vw] h-[32vw] sm:w-[145px] sm:h-[155px] md:w-[172px] md:h-[182px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

      </div>

      {/* ── Right: member name list*/}
      <div className="hidden md:flex md:flex-col gap-4 md:gap-5 pt-2 flex-1 w-full">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            hoveredId={hoveredId}
            onHover={setHoveredId}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Photo card 
───────────────────────────────────────── */

function PhotoCard({ member, className, hoveredId, onHover }) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl cursor-pointer flex-shrink-0 transition-opacity duration-400',
        className,
        isDimmed ? 'opacity-60' : 'opacity-100',
      )}
      onMouseEnter={() => {
        if (window.innerWidth >= 768) onHover(member.id);
      }}
      onMouseLeave={() => {
        if (window.innerWidth >= 768) onHover(null);
      }}
      onClick={() => {
        if (window.innerWidth < 768) {
          onHover(isActive ? null : member.id);
        }
      }}
    >
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-cover transition-[filter] duration-500"
        style={{
          filter: isActive ? 'grayscale(0) brightness(1)' : 'grayscale(1) brightness(0.77)',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Member name section
───────────────────────────────────────── */

function MemberRow({ member, hoveredId, onHover }) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const hasSocial = member.social?.twitter || member.social?.linkedin || member.social?.instagram || member.social?.behance;

  return (
    <div
      className={cn(
        'cursor-pointer transition-opacity duration-300',
        isDimmed ? 'opacity-50' : 'opacity-100',
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Name + social*/}
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'w-4 h-3 rounded-[5px] flex-shrink-0 transition-all duration-300',
            isActive ? 'bg-ink w-5 opacity-100' : 'bg-ink opacity-25',
          )}
        />
        <span
          className={cn(
            'text-base md:text-[18px] font-semibold leading-none tracking-tight transition-colors duration-300',
            isActive ? 'text-ink opacity-100' : 'text-ink opacity-80',
          )}
        >
          {member.name}
        </span>

        {/* Social icons */}
        {hasSocial && (
          <div
            className={cn(
              'flex items-center gap-1.5 ml-0.5 transition-all duration-200',
              isActive
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-2 pointer-events-none',
            )}
          >
            {member.social?.twitter && (
              <a
                href={member.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-gray-500 hover:text-ink hover:bg-[#0b1120]/10 transition-all duration-150 hover:scale-110"
                title="X / Twitter"
              >
                <FaTwitter size={10} />
              </a>
            )}
            {member.social?.linkedin && (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-gray-500 hover:text-ink hover:bg-[#0b1120]/10 transition-all duration-150 hover:scale-110"
                title="LinkedIn"
              >
                <FaLinkedinIn size={10} />
              </a>
            )}
            {member.social?.instagram && (
              <a
                href={member.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-gray-500 hover:text-ink hover:bg-[#0b1120]/10 transition-all duration-150 hover:scale-110"
                title="Instagram"
              >
                <FaInstagram size={10} />
              </a>
            )}
            {member.social?.behance && (
              <a
                href={member.social.behance}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-gray-500 hover:text-ink hover:bg-[#0b1120]/10 transition-all duration-150 hover:scale-110"
                title="Behance"
              >
                <FaBehance size={10} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Role */}
      <p className="mt-1.5 pl-[27px] text-[7px] md:text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500">
        {member.role}
      </p>
    </div>
  );
}
