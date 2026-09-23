"use client"

import { useState } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { cn } from "../../lib/utils"
import { Grid3X3, Layers, LayoutList, Fingerprint, Building, Leaf, Network, Map, Clapperboard, Dna, FlaskConical, Shield, Users } from "lucide-react"

const layoutIcons = {
  stack: Layers,
  grid: Grid3X3,
  list: LayoutList,
}

const SWIPE_THRESHOLD = 50

export function MorphingCardStack({
  cards = [],
  className,
  defaultLayout = "stack",
  onCardClick,
}) {
  const [layout, setLayout] = useState(defaultLayout)
  const [expandedCard, setExpandedCard] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  if (!cards || cards.length === 0) {
    return null
  }

  const getColumns = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1024) return 3; // lg
    if (window.innerWidth >= 768) return 2;  // md
    return 1;                                // sm
  };

  const handleDragEnd = (event, info) => {
    const { offset, velocity } = info
    const swipe = Math.abs(offset.x) * velocity.x

    if (offset.x < -SWIPE_THRESHOLD || swipe < -1000) {
      // Swiped left - go to next card
      setActiveIndex((prev) => (prev + 1) % cards.length)
    } else if (offset.x > SWIPE_THRESHOLD || swipe > 1000) {
      // Swiped right - go to previous card
      setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }
    setIsDragging(false)
  }

  const getStackOrder = () => {
    const reordered = []
    for (let i = 0; i < cards.length; i++) {
      const index = (activeIndex + i) % cards.length
      reordered.push({ ...cards[index], stackPosition: i })
    }
    return reordered.reverse() // Reverse so top card renders last (on top)
  }

  const getLayoutStyles = (stackPosition) => {
    switch (layout) {
      case "stack":
        return {
          top: Math.min(stackPosition * 4, 32),
          left: Math.min(stackPosition * 4, 32),
          zIndex: cards.length - stackPosition,
          rotate: (stackPosition - 1) * 1.5,
        }
      case "grid":
        return {
          top: 0,
          left: 0,
          zIndex: 1,
          rotate: 0,
        }
      case "list":
        return {
          top: 0,
          left: 0,
          zIndex: 1,
          rotate: 0,
        }
    }
  }

  const containerStyles = {
    stack: "relative h-[340px] md:h-[420px] w-full max-w-[340px]",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start gap-6 w-full max-w-6xl",
    list: "flex flex-col items-start gap-4 w-full max-w-4xl",
  }

  const displayCards = layout === "stack" ? getStackOrder() : cards.map((c, i) => ({ ...c, stackPosition: i }))

  return (
    <div className={cn("space-y-8 w-full", className)}>
      {/* Layout Toggle */}
      <div className="flex items-center justify-center gap-1 rounded-lg bg-[#111111] p-1 w-fit mx-auto border border-white/10">
        {Object.keys(layoutIcons).map((mode) => {
          const Icon = layoutIcons[mode]
          return (
            <button
              key={mode}
              onClick={() => {
                setLayout(mode)
                setExpandedCard(null)
              }}
              className={cn(
                "rounded-md p-2 transition-all",
                layout === mode
                  ? "bg-[#e5e5e5] text-black"
                  : "text-white/40 hover:text-white hover:bg-white/5",
              )}
              aria-label={`Switch to ${mode} layout`}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </div>

      {/* Cards Container */}
      <LayoutGroup>
        <motion.div layout className={cn(containerStyles[layout], "mx-auto")}>
          <AnimatePresence mode="popLayout">
            {displayCards.map((card) => {
              const styles = getLayoutStyles(card.stackPosition)
              const isExpanded = expandedCard === card.id
              const isTopCard = layout === "stack" && card.stackPosition === 0

              let isSameRow = false;
              if (expandedCard && layout === "grid") {
                const cols = getColumns();
                const expandedIndex = displayCards.findIndex(c => c.id === expandedCard);
                const expandedRow = Math.floor(expandedIndex / cols);
                const myRow = Math.floor(card.stackPosition / cols);
                isSameRow = myRow === expandedRow;
              }

              return (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: isExpanded ? 1.02 : 1,
                    x: 0,
                    ...styles,
                  }}
                  exit={{ opacity: 0, scale: 0.8, x: -200 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  drag={isTopCard ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                  onClick={() => {
                    if (isDragging) return
                    setExpandedCard(isExpanded ? null : card.id)
                    if (onCardClick) onCardClick(card)
                  }}
                  className={cn(
                    "cursor-pointer rounded-2xl border border-black/5 bg-white p-6 sm:p-8",
                    "hover:border-black/10 transition-colors shadow-lg overflow-hidden",
                    layout === "stack" && "absolute top-0 w-full min-h-full h-auto",
                    layout === "stack" && isTopCard && "cursor-grab active:cursor-grabbing",
                    layout === "grid" && "w-full h-full min-h-[260px] md:min-h-[300px]",
                    layout === "list" && "w-full",
                    isExpanded && "ring-2 ring-[#0b1120]",
                  )}
                  style={{
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div className="flex items-start gap-4 flex-col h-full">
                    {card.icon && (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-[#0b1120] border border-gray-200">
                        {card.icon}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 w-full flex flex-col">
                      <h3 className="font-semibold text-[#0b1120] text-lg md:text-2xl tracking-tight mb-2">{card.title}</h3>
                      <p
                        className={cn(
                          "text-[14px] md:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap",
                          layout === "stack" ? "line-clamp-6" : (
                            !isExpanded && layout === "grid" && !isSameRow ? "line-clamp-4" :
                            !isExpanded && layout === "list" ? "line-clamp-2" : ""
                          ),
                          layout === "stack" && !isExpanded && "cursor-pointer"
                        )}
                      >
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {isTopCard && !isExpanded && (
                    <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                      <span className="text-sm text-gray-400">
                        Swipe to navigate
                      </span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {layout === "stack" && cards.length > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/20 hover:bg-white/40",
              )}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
