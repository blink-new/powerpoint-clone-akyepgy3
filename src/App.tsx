import React, { useState, useRef, useCallback, useEffect } from 'react'
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Type, Square, Circle, Triangle, Image, Play, Save, Undo, Redo,
  Copy, Clipboard, Scissors, ZoomIn, ZoomOut, Grid, Eye, FileText,
  ChevronDown, MoreHorizontal, Palette, Shapes, Monitor,
  MousePointer, Hand, Minus, Plus, Settings, Home, FileImage,
  Layers, RotateCcw, RotateCw, FlipHorizontal, FlipVertical,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Star, Heart,
  Hexagon, Pentagon, Octagon, Diamond, Zap, Sun, Moon,
  Cloud, Umbrella, Snowflake, Flame, Droplets, Wind, Move,
  Trash2, Download, Upload, PaintBucket, Brush, Eraser,
  Volume2, Music, Video, Calendar, Clock, MapPin, Phone,
  Mail, Globe, Wifi, Battery, Signal, Camera, Mic, Speaker
} from 'lucide-react'
import { Button } from './components/ui/button'
import { Separator } from './components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Slider } from './components/ui/slider'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/dropdown-menu'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './components/ui/context-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { Card } from './components/ui/card'

interface Slide {
  id: string
  title: string
  content: string
  elements: SlideElement[]
  notes: string
  background: string
  transition: SlideTransition
  layout: 'title' | 'content' | 'twoColumn' | 'blank'
}

interface SlideElement {
  id: string
  type: 'text' | 'shape' | 'image'
  x: number
  y: number
  width: number
  height: number
  content?: string
  style?: any
  rotation?: number
  animation?: {
    type: 'fadeIn' | 'slideIn' | 'bounce' | 'zoom' | 'none'
    duration: number
    delay: number
  }
}

interface SlideTransition {
  type: 'none' | 'fade' | 'slide' | 'zoom' | 'flip'
  duration: number
}

const PowerPointClone: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      title: 'Slide 1',
      content: 'Click to add title',
      elements: [],
      notes: 'Click to add notes',
      background: '#ffffff',
      transition: { type: 'none', duration: 500 },
      layout: 'title'
    }
  ])
  const [activeSlideId, setActiveSlideId] = useState('1')
  const [activeTab, setActiveTab] = useState('home')
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [isPresenting, setIsPresenting] = useState(false)
  const [showNotes, setShowNotes] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState('')
  const [history, setHistory] = useState<Slide[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const canvasRef = useRef<HTMLDivElement>(null)

  const activeSlide = slides.find(slide => slide.id === activeSlideId)

  // Save state to history for undo/redo
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(slides)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [slides, history, historyIndex])

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setSlides(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }, [history, historyIndex])

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setSlides(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }, [history, historyIndex])

  const deleteElement = useCallback((elementId: string) => {
    const updatedSlides = slides.map(slide => 
      slide.id === activeSlideId 
        ? { ...slide, elements: slide.elements.filter(el => el.id !== elementId) }
        : slide
    )
    setSlides(updatedSlides)
    setSelectedElement(null)
    saveToHistory()
  }, [slides, activeSlideId, saveToHistory])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'c':
            if (selectedElement) {
              e.preventDefault()
              // Copy functionality would go here
            }
            break
          case 'v':
            e.preventDefault()
            // Paste functionality would go here
            break
          case 's':
            e.preventDefault()
            // Save functionality would go here
            break
        }
      }
      if (e.key === 'Delete' && selectedElement) {
        deleteElement(selectedElement)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElement, undo, redo, deleteElement])

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Slide ${slides.length + 1}`,
      content: 'Click to add title',
      elements: [],
      notes: 'Click to add notes',
      background: '#ffffff',
      transition: { type: 'none', duration: 500 },
      layout: 'title'
    }
    setSlides([...slides, newSlide])
    setActiveSlideId(newSlide.id)
    saveToHistory()
  }

  const deleteSlide = (slideId: string) => {
    if (slides.length > 1) {
      const newSlides = slides.filter(slide => slide.id !== slideId)
      setSlides(newSlides)
      if (activeSlideId === slideId) {
        setActiveSlideId(newSlides[0].id)
      }
    }
  }

  const duplicateSlide = (slideId: string) => {
    const slideToClone = slides.find(slide => slide.id === slideId)
    if (slideToClone) {
      const newSlide: Slide = {
        ...slideToClone,
        id: Date.now().toString(),
        title: `${slideToClone.title} Copy`
      }
      const slideIndex = slides.findIndex(slide => slide.id === slideId)
      const newSlides = [...slides]
      newSlides.splice(slideIndex + 1, 0, newSlide)
      setSlides(newSlides)
      saveToHistory()
    }
  }

  const addTextBox = () => {
    if (!activeSlide) return
    const newElement: SlideElement = {
      id: Date.now().toString(),
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      content: 'Click to add text',
      style: {
        fontSize: '16px',
        fontFamily: 'Segoe UI',
        color: '#000000',
        textAlign: 'left'
      },
      animation: {
        type: 'none',
        duration: 500,
        delay: 0
      }
    }
    
    const updatedSlides = slides.map(slide => 
      slide.id === activeSlideId 
        ? { ...slide, elements: [...slide.elements, newElement] }
        : slide
    )
    setSlides(updatedSlides)
    setSelectedElement(newElement.id)
    saveToHistory()
  }

  const addShape = (shapeType: string) => {
    if (!activeSlide) return
    const newElement: SlideElement = {
      id: Date.now().toString(),
      type: 'shape',
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      content: shapeType,
      style: {
        fill: '#4285f4',
        stroke: '#1a73e8',
        strokeWidth: 2
      },
      animation: {
        type: 'none',
        duration: 500,
        delay: 0
      }
    }
    
    const updatedSlides = slides.map(slide => 
      slide.id === activeSlideId 
        ? { ...slide, elements: [...slide.elements, newElement] }
        : slide
    )
    setSlides(updatedSlides)
    setSelectedElement(newElement.id)
    saveToHistory()
  }

  const startPresentation = () => {
    setIsPresenting(true)
    setActiveSlideId(slides[0].id)
  }

  const exitPresentation = () => {
    setIsPresenting(false)
  }

  const nextSlide = () => {
    const currentIndex = slides.findIndex(slide => slide.id === activeSlideId)
    if (currentIndex < slides.length - 1) {
      setActiveSlideId(slides[currentIndex + 1].id)
    }
  }

  const prevSlide = () => {
    const currentIndex = slides.findIndex(slide => slide.id === activeSlideId)
    if (currentIndex > 0) {
      setActiveSlideId(slides[currentIndex - 1].id)
    }
  }

  // Presentation Mode
  if (isPresenting) {
    return (
      <div className="powerpoint-presentation-overlay">
        <div className="w-full h-full flex items-center justify-center">
          <div 
            className="powerpoint-presentation-slide"
            style={{ 
              width: '90vw', 
              height: '67.5vw', 
              maxWidth: '1200px', 
              maxHeight: '900px',
              aspectRatio: '4/3'
            }}
          >
            <div className="w-full h-full p-8 relative">
              <h1 className="text-4xl font-bold mb-6 text-center">
                {activeSlide?.content}
              </h1>
              {activeSlide?.elements.map(element => (
                <div
                  key={element.id}
                  className="absolute"
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined
                  }}
                >
                  {element.type === 'text' && (
                    <div 
                      className="w-full h-full flex items-center"
                      style={element.style}
                    >
                      {element.content}
                    </div>
                  )}
                  {element.type === 'shape' && (
                    <div className="w-full h-full flex items-center justify-center">
                      {element.content === 'rectangle' && (
                        <div 
                          className="w-full h-full"
                          style={{
                            backgroundColor: element.style?.fill,
                            border: `${element.style?.strokeWidth}px solid ${element.style?.stroke}`
                          }}
                        />
                      )}
                      {element.content === 'circle' && (
                        <div 
                          className="w-full h-full rounded-full"
                          style={{
                            backgroundColor: element.style?.fill,
                            border: `${element.style?.strokeWidth}px solid ${element.style?.stroke}`
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Presentation Controls */}
        <div className="powerpoint-presentation-controls">
          <button className="powerpoint-presentation-button" onClick={prevSlide}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          <button className="powerpoint-presentation-button" onClick={exitPresentation}>
            Exit
          </button>
          <button className="powerpoint-presentation-button" onClick={nextSlide}>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
        
        <div className="powerpoint-presentation-info">
          {slides.findIndex(s => s.id === activeSlideId) + 1} / {slides.length}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-powerpoint-gray-50 font-segoe overflow-hidden">
      {/* Title Bar */}
      <div className="powerpoint-title-bar">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          <span className="font-semibold">PowerPoint</span>
        </div>
        <div className="flex-1 text-center">
          Presentation1 - PowerPoint
        </div>
        <div className="flex items-center gap-1">
          <button className="powerpoint-qat-button text-white hover:bg-white/20">
            <Minus className="w-3 h-3" />
          </button>
          <button className="powerpoint-qat-button text-white hover:bg-white/20">
            <Square className="w-3 h-3" />
          </button>
          <button className="powerpoint-qat-button text-white hover:bg-white/20">
            ×
          </button>
        </div>
      </div>

      {/* Quick Access Toolbar */}
      <div className="powerpoint-qat">
        <button className="powerpoint-qat-button" title="Save">
          <Save className="w-3 h-3" />
        </button>
        <button 
          className="powerpoint-qat-button" 
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-3 h-3" />
        </button>
        <button 
          className="powerpoint-qat-button" 
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-3 h-3" />
        </button>
        <div className="powerpoint-group-separator" />
        <button className="powerpoint-qat-button px-2 text-xs">
          File
        </button>
      </div>

      {/* Ribbon Tabs */}
      <div className="powerpoint-ribbon-tabs">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-8 bg-transparent border-0 rounded-none p-0 flex">
            <TabsTrigger value="file" className="powerpoint-ribbon-tab">File</TabsTrigger>
            <TabsTrigger value="home" className="powerpoint-ribbon-tab">Home</TabsTrigger>
            <TabsTrigger value="insert" className="powerpoint-ribbon-tab">Insert</TabsTrigger>
            <TabsTrigger value="design" className="powerpoint-ribbon-tab">Design</TabsTrigger>
            <TabsTrigger value="transitions" className="powerpoint-ribbon-tab">Transitions</TabsTrigger>
            <TabsTrigger value="animations" className="powerpoint-ribbon-tab">Animations</TabsTrigger>
            <TabsTrigger value="slideshow" className="powerpoint-ribbon-tab">Slide Show</TabsTrigger>
            <TabsTrigger value="review" className="powerpoint-ribbon-tab">Review</TabsTrigger>
            <TabsTrigger value="view" className="powerpoint-ribbon-tab">View</TabsTrigger>
          </TabsList>

          {/* Home Tab Content */}
          <TabsContent value="home" className="mt-0 powerpoint-ribbon-content">
            <div className="flex items-start gap-2">
              {/* Clipboard Group */}
              <div className="powerpoint-toolbar-group">
                <div className="powerpoint-group-label">Clipboard</div>
                <div className="powerpoint-group-buttons">
                  <button className="powerpoint-toolbar-button">
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  <button className="powerpoint-toolbar-button">
                    <Clipboard className="w-4 h-4" />
                    <span>Paste</span>
                  </button>
                  <button className="powerpoint-toolbar-button">
                    <Scissors className="w-4 h-4" />
                    <span>Cut</span>
                  </button>
                </div>
              </div>

              <div className="powerpoint-group-separator" />

              {/* Font Group */}
              <div className="powerpoint-toolbar-group">
                <div className="powerpoint-group-label">Font</div>
                <div className="flex items-center gap-1">
                  <select className="powerpoint-select w-32 h-6 text-xs" defaultValue="segoe">
                    <option value="segoe">Segoe UI</option>
                    <option value="arial">Arial</option>
                    <option value="times">Times New Roman</option>
                  </select>
                  <select className="powerpoint-select w-16 h-6 text-xs" defaultValue="16">
                    <option value="12">12</option>
                    <option value="14">14</option>
                    <option value="16">16</option>
                    <option value="18">18</option>
                    <option value="24">24</option>
                  </select>
                  <button className="powerpoint-toolbar-button-small">
                    <Bold className="w-3 h-3" />
                  </button>
                  <button className="powerpoint-toolbar-button-small">
                    <Italic className="w-3 h-3" />
                  </button>
                  <button className="powerpoint-toolbar-button-small">
                    <Underline className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="powerpoint-group-separator" />

              {/* Paragraph Group */}
              <div className="powerpoint-toolbar-group">
                <div className="powerpoint-group-label">Paragraph</div>
                <div className="flex gap-1">
                  <button className="powerpoint-toolbar-button-small">
                    <AlignLeft className="w-3 h-3" />
                  </button>
                  <button className="powerpoint-toolbar-button-small">
                    <AlignCenter className="w-3 h-3" />
                  </button>
                  <button className="powerpoint-toolbar-button-small">
                    <AlignRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="powerpoint-group-separator" />

              {/* Drawing Group */}
              <div className="powerpoint-toolbar-group">
                <div className="powerpoint-group-label">Drawing</div>
                <div className="powerpoint-group-buttons">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="powerpoint-toolbar-button">
                        <Shapes className="w-4 h-4" />
                        <span>Shapes</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80">
                      <div className="p-2">
                        <div className="text-xs font-semibold mb-2 text-powerpoint-gray-600">Basic Shapes</div>
                        <div className="grid grid-cols-8 gap-2 mb-3">
                          <Button variant="ghost" size="sm" onClick={() => addShape('rectangle')} title="Rectangle">
                            <Square className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('circle')} title="Circle">
                            <Circle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('triangle')} title="Triangle">
                            <Triangle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('diamond')} title="Diamond">
                            <Diamond className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('star')} title="Star">
                            <Star className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('heart')} title="Heart">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('hexagon')} title="Hexagon">
                            <Hexagon className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('pentagon')} title="Pentagon">
                            <Pentagon className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-xs font-semibold mb-2 text-powerpoint-gray-600">Arrows</div>
                        <div className="grid grid-cols-8 gap-2 mb-3">
                          <Button variant="ghost" size="sm" onClick={() => addShape('arrow-up')} title="Arrow Up">
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('arrow-down')} title="Arrow Down">
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('arrow-left')} title="Arrow Left">
                            <ArrowLeft className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('arrow-right')} title="Arrow Right">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-xs font-semibold mb-2 text-powerpoint-gray-600">Icons</div>
                        <div className="grid grid-cols-8 gap-2">
                          <Button variant="ghost" size="sm" onClick={() => addShape('sun')} title="Sun">
                            <Sun className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('moon')} title="Moon">
                            <Moon className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('cloud')} title="Cloud">
                            <Cloud className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('flame')} title="Flame">
                            <Flame className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('droplets')} title="Droplets">
                            <Droplets className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('zap')} title="Lightning">
                            <Zap className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('phone')} title="Phone">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addShape('mail')} title="Mail">
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button className="powerpoint-toolbar-button" onClick={addTextBox}>
                    <Type className="w-4 h-4" />
                    <span>Text Box</span>
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Insert Tab Content */}
          <TabsContent value="insert" className="mt-0 p-2 bg-powerpoint-gray-50 border-b border-powerpoint-gray-300">
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-powerpoint-gray-600 mb-1">Slides</div>
                <div className="flex gap-1">
                  <Button variant="ghost" className="powerpoint-toolbar-button" onClick={addSlide}>
                    <Plus className="w-4 h-4 mb-1" />
                    <span>New Slide</span>
                  </Button>
                </div>
              </div>

              <Separator orientation="vertical" className="h-16" />

              <div className="flex flex-col gap-1">
                <div className="text-xs text-powerpoint-gray-600 mb-1">Images</div>
                <div className="flex gap-1">
                  <Button variant="ghost" className="powerpoint-toolbar-button">
                    <FileImage className="w-4 h-4 mb-1" />
                    <span>Pictures</span>
                  </Button>
                  <Button variant="ghost" className="powerpoint-toolbar-button">
                    <Image className="w-4 h-4 mb-1" />
                    <span>Online Pictures</span>
                  </Button>
                </div>
              </div>

              <Separator orientation="vertical" className="h-16" />

              <div className="flex flex-col gap-1">
                <div className="text-xs text-powerpoint-gray-600 mb-1">Illustrations</div>
                <div className="flex gap-1">
                  <Button variant="ghost" className="powerpoint-toolbar-button">
                    <Shapes className="w-4 h-4 mb-1" />
                    <span>Shapes</span>
                  </Button>
                  <Button variant="ghost" className="powerpoint-toolbar-button">
                    <Zap className="w-4 h-4 mb-1" />
                    <span>Icons</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Design Tab Content */}
          <TabsContent value="design" className="mt-0 p-2 bg-powerpoint-gray-50 border-b border-powerpoint-gray-300">
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-powerpoint-gray-600 mb-1">Themes</div>
                <div className="flex gap-2">
                  {['#ffffff', '#f8f9fa', '#e3f2fd', '#f3e5f5', '#fff3e0'].map((color, index) => (
                    <div
                      key={index}
                      className="w-16 h-12 border border-gray-300 cursor-pointer hover:border-powerpoint-orange"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        const updatedSlides = slides.map(slide => 
                          slide.id === activeSlideId 
                            ? { ...slide, background: color }
                            : slide
                        )
                        setSlides(updatedSlides)
                        saveToHistory()
                      }}
                    />
                  ))}
                </div>
              </div>

              <Separator orientation="vertical" className="h-16" />

              <div className="flex flex-col gap-1">
                <div className="text-xs text-powerpoint-gray-600 mb-1">Variants</div>
                <div className="flex gap-1">
                  <Button variant="ghost" className="powerpoint-toolbar-button">
                    <Palette className="w-4 h-4 mb-1" />
                    <span>Colors</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Transitions Tab Content */}
          <TabsContent value="transitions" className="mt-0 p-2 bg-powerpoint-gray-50 border-b border-powerpoint-gray-300">
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-powerpoint-gray-600 mb-1">Transition to This Slide</div>
                <div className="flex gap-2">
                  {[
                    { type: 'none', name: 'None' },
                    { type: 'fade', name: 'Fade' },
                    { type: 'slide', name: 'Push' },
                    { type: 'zoom', name: 'Zoom' },
                    { type: 'flip', name: 'Flip' }
                  ].map((transition) => (
                    <Button
                      key={transition.type}
                      variant="ghost"
                      className={`powerpoint-toolbar-button ${
                        activeSlide?.transition.type === transition.type ? 'bg-powerpoint-blue/10 border-powerpoint-blue' : ''
                      }`}
                      onClick={() => {
                        const updatedSlides = slides.map(slide => 
                          slide.id === activeSlideId 
                            ? { ...slide, transition: { ...slide.transition, type: transition.type as any } }
                            : slide
                        )
                        setSlides(updatedSlides)
                        saveToHistory()
                      }}
                    >
                      <Play className="w-4 h-4 mb-1" />
                      <span>{transition.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator orientation="vertical" className="h-16" />

              <div className="flex flex-col gap-1">
                <div className="text-xs text-powerpoint-gray-600 mb-1">Timing</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Duration:</span>
                  <Select 
                    value={activeSlide?.transition.duration.toString() || '500'}
                    onValueChange={(value) => {
                      const updatedSlides = slides.map(slide => 
                        slide.id === activeSlideId 
                          ? { ...slide, transition: { ...slide.transition, duration: parseInt(value) } }
                          : slide
                      )
                      setSlides(updatedSlides)
                      saveToHistory()
                    }}
                  >
                    <SelectTrigger className="w-20 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="250">0.25s</SelectItem>
                      <SelectItem value="500">0.5s</SelectItem>
                      <SelectItem value="750">0.75s</SelectItem>
                      <SelectItem value="1000">1s</SelectItem>
                      <SelectItem value="1500">1.5s</SelectItem>
                      <SelectItem value="2000">2s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Animations Tab Content */}
          <TabsContent value="animations" className="mt-0 p-2 bg-powerpoint-gray-50 border-b border-powerpoint-gray-300">
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-powerpoint-gray-600 mb-1">Animation</div>
                <div className="flex gap-2">
                  {selectedElement ? (
                    <>
                      {[
                        { type: 'none', name: 'None' },
                        { type: 'fadeIn', name: 'Fade In' },
                        { type: 'slideIn', name: 'Slide In' },
                        { type: 'bounce', name: 'Bounce' },
                        { type: 'zoom', name: 'Zoom' }
                      ].map((animation) => (
                        <Button
                          key={animation.type}
                          variant="ghost"
                          className="powerpoint-toolbar-button"
                          onClick={() => {
                            const updatedSlides = slides.map(slide => 
                              slide.id === activeSlideId 
                                ? { 
                                    ...slide, 
                                    elements: slide.elements.map(el => 
                                      el.id === selectedElement 
                                        ? { ...el, animation: { ...el.animation!, type: animation.type as any } }
                                        : el
                                    )
                                  }
                                : slide
                            )
                            setSlides(updatedSlides)
                            saveToHistory()
                          }}
                        >
                          <Zap className="w-4 h-4 mb-1" />
                          <span>{animation.name}</span>
                        </Button>
                      ))}
                    </>
                  ) : (
                    <div className="text-xs text-powerpoint-gray-500 py-4">
                      Select an object to add animations
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Slide Show Tab Content */}
          <TabsContent value="slideshow" className="mt-0 p-2 bg-powerpoint-gray-50 border-b border-powerpoint-gray-300">
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-powerpoint-gray-600 mb-1">Start Slide Show</div>
                <div className="flex gap-1">
                  <Button variant="ghost" className="powerpoint-toolbar-button" onClick={startPresentation}>
                    <Play className="w-4 h-4 mb-1" />
                    <span>From Start</span>
                  </Button>
                  <Button variant="ghost" className="powerpoint-toolbar-button">
                    <Play className="w-4 h-4 mb-1" />
                    <span>From Current</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* View Tab Content */}
          <TabsContent value="view" className="mt-0 p-2 bg-powerpoint-gray-50 border-b border-powerpoint-gray-300">
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-powerpoint-gray-600 mb-1">Presentation Views</div>
                <div className="flex gap-1">
                  <Button variant="ghost" className="powerpoint-toolbar-button">
                    <Eye className="w-4 h-4 mb-1" />
                    <span>Normal</span>
                  </Button>
                  <Button variant="ghost" className="powerpoint-toolbar-button">
                    <Layers className="w-4 h-4 mb-1" />
                    <span>Slide Sorter</span>
                  </Button>
                </div>
              </div>

              <Separator orientation="vertical" className="h-16" />

              <div className="flex flex-col gap-1">
                <div className="text-xs text-powerpoint-gray-600 mb-1">Show</div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    className={`powerpoint-toolbar-button ${showGrid ? 'active' : ''}`}
                    onClick={() => setShowGrid(!showGrid)}
                  >
                    <Grid className="w-4 h-4 mb-1" />
                    <span>Gridlines</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`powerpoint-toolbar-button ${showNotes ? 'active' : ''}`}
                    onClick={() => setShowNotes(!showNotes)}
                  >
                    <FileText className="w-4 h-4 mb-1" />
                    <span>Notes</span>
                  </Button>
                </div>
              </div>

              <Separator orientation="vertical" className="h-16" />

              <div className="flex flex-col gap-1">
                <div className="text-xs text-powerpoint-gray-600 mb-1">Zoom</div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(10, zoom - 10))}>
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                  <span className="text-xs w-12 text-center">{zoom}%</span>
                  <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(400, zoom + 10))}>
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Slide Thumbnails Panel */}
        <div className="powerpoint-thumbnails-panel">
          <div className="powerpoint-thumbnails-header">
            <button 
              className="w-full flex items-center justify-start gap-2 px-3 py-2 text-xs border border-powerpoint-gray-200 rounded-sm hover:bg-powerpoint-gray-100 transition-colors"
              onClick={addSlide}
            >
              <Plus className="w-3 h-3" />
              New Slide
            </button>
          </div>
          
          <div className="powerpoint-thumbnails-list">
            {slides.map((slide, index) => (
              <ContextMenu key={slide.id}>
                <ContextMenuTrigger>
                  <div
                    className={`powerpoint-slide-thumbnail ${slide.id === activeSlideId ? 'active' : ''}`}
                    onClick={() => setActiveSlideId(slide.id)}
                  >
                    <div className="powerpoint-slide-thumbnail-content">
                      <div className="powerpoint-slide-number">{index + 1}</div>
                      <div className="powerpoint-slide-title">{slide.title}</div>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => duplicateSlide(slide.id)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate Slide
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => deleteSlide(slide.id)}
                    disabled={slides.length <= 1}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Slide
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="powerpoint-canvas-area flex-1">
            <div 
              ref={canvasRef}
              className="powerpoint-slide-canvas"
              style={{ 
                width: `${720 * (zoom / 100)}px`, 
                height: `${540 * (zoom / 100)}px`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center'
              }}
            >
              {/* Grid Overlay */}
              {showGrid && (
                <div className="powerpoint-grid-overlay" />
              )}

              {/* Slide Content */}
              <div className="w-full h-full p-8 relative">
                {/* Title Area */}
                <div 
                  className="text-center text-2xl font-bold text-powerpoint-gray-800 cursor-text border-2 border-transparent hover:border-powerpoint-blue/30 p-4 rounded"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updatedSlides = slides.map(slide => 
                      slide.id === activeSlideId 
                        ? { ...slide, content: e.currentTarget.textContent || '' }
                        : slide
                    )
                    setSlides(updatedSlides)
                  }}
                >
                  {activeSlide?.content}
                </div>

                {/* Slide Elements */}
                {activeSlide?.elements.map(element => (
                  <ContextMenu key={element.id}>
                    <ContextMenuTrigger>
                      <div
                        className={`absolute cursor-move border-2 ${
                          selectedElement === element.id 
                            ? 'border-powerpoint-blue' 
                            : 'border-transparent hover:border-powerpoint-blue/30'
                        }`}
                        style={{
                          left: element.x,
                          top: element.y,
                          width: element.width,
                          height: element.height,
                          transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined
                        }}
                        onClick={() => setSelectedElement(element.id)}
                      >
                    {element.type === 'text' && (
                      <div 
                        className="w-full h-full flex items-center cursor-text p-2"
                        style={element.style}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const updatedSlides = slides.map(slide => 
                            slide.id === activeSlideId 
                              ? { 
                                  ...slide, 
                                  elements: slide.elements.map(el => 
                                    el.id === element.id 
                                      ? { ...el, content: e.currentTarget.textContent || '' }
                                      : el
                                  )
                                }
                              : slide
                          )
                          setSlides(updatedSlides)
                        }}
                      >
                        {element.content}
                      </div>
                    )}
                    
                    {element.type === 'shape' && (
                      <div className="w-full h-full flex items-center justify-center">
                        {element.content === 'rectangle' && (
                          <div 
                            className="w-full h-full"
                            style={{
                              backgroundColor: element.style?.fill,
                              border: `${element.style?.strokeWidth}px solid ${element.style?.stroke}`
                            }}
                          />
                        )}
                        {element.content === 'circle' && (
                          <div 
                            className="w-full h-full rounded-full"
                            style={{
                              backgroundColor: element.style?.fill,
                              border: `${element.style?.strokeWidth}px solid ${element.style?.stroke}`
                            }}
                          />
                        )}
                        {element.content === 'triangle' && (
                          <div 
                            className="w-0 h-0"
                            style={{
                              borderLeft: `${element.width/2}px solid transparent`,
                              borderRight: `${element.width/2}px solid transparent`,
                              borderBottom: `${element.height}px solid ${element.style?.fill}`
                            }}
                          />
                        )}
                        {element.content === 'diamond' && (
                          <div 
                            className="w-full h-full"
                            style={{
                              backgroundColor: element.style?.fill,
                              border: `${element.style?.strokeWidth}px solid ${element.style?.stroke}`,
                              transform: 'rotate(45deg)',
                              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                            }}
                          />
                        )}
                        {(element.content === 'star' || element.content === 'heart' || element.content === 'hexagon' || 
                          element.content === 'pentagon' || element.content === 'sun' || element.content === 'moon' ||
                          element.content === 'cloud' || element.content === 'flame' || element.content === 'droplets' ||
                          element.content === 'zap' || element.content === 'phone' || element.content === 'mail' ||
                          element.content?.startsWith('arrow-')) && (
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ color: element.style?.fill }}
                          >
                            {element.content === 'star' && <Star className="w-full h-full" />}
                            {element.content === 'heart' && <Heart className="w-full h-full" />}
                            {element.content === 'hexagon' && <Hexagon className="w-full h-full" />}
                            {element.content === 'pentagon' && <Pentagon className="w-full h-full" />}
                            {element.content === 'sun' && <Sun className="w-full h-full" />}
                            {element.content === 'moon' && <Moon className="w-full h-full" />}
                            {element.content === 'cloud' && <Cloud className="w-full h-full" />}
                            {element.content === 'flame' && <Flame className="w-full h-full" />}
                            {element.content === 'droplets' && <Droplets className="w-full h-full" />}
                            {element.content === 'zap' && <Zap className="w-full h-full" />}
                            {element.content === 'phone' && <Phone className="w-full h-full" />}
                            {element.content === 'mail' && <Mail className="w-full h-full" />}
                            {element.content === 'arrow-up' && <ArrowUp className="w-full h-full" />}
                            {element.content === 'arrow-down' && <ArrowDown className="w-full h-full" />}
                            {element.content === 'arrow-left' && <ArrowLeft className="w-full h-full" />}
                            {element.content === 'arrow-right' && <ArrowRight className="w-full h-full" />}
                          </div>
                        )}
                      </div>
                    )}

                        {/* Selection Handles */}
                        {selectedElement === element.id && (
                          <>
                            <div className="powerpoint-selection-handle -top-1 -left-1 cursor-nw-resize" />
                            <div className="powerpoint-selection-handle -top-1 left-1/2 transform -translate-x-1/2 cursor-n-resize" />
                            <div className="powerpoint-selection-handle -top-1 -right-1 cursor-ne-resize" />
                            <div className="powerpoint-selection-handle top-1/2 -right-1 transform -translate-y-1/2 cursor-e-resize" />
                            <div className="powerpoint-selection-handle -bottom-1 -right-1 cursor-se-resize" />
                            <div className="powerpoint-selection-handle -bottom-1 left-1/2 transform -translate-x-1/2 cursor-s-resize" />
                            <div className="powerpoint-selection-handle -bottom-1 -left-1 cursor-sw-resize" />
                            <div className="powerpoint-selection-handle top-1/2 -left-1 transform -translate-y-1/2 cursor-w-resize" />
                          </>
                        )}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => {
                        // Copy element functionality would go here
                      }}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => deleteElement(element.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Panel */}
      {showNotes && (
        <div className="powerpoint-notes-panel h-32">
          <label className="powerpoint-notes-label">Notes</label>
          <textarea
            className="powerpoint-notes-textarea h-20"
            placeholder="Click to add notes"
            value={activeSlide?.notes || ''}
            onChange={(e) => {
              const updatedSlides = slides.map(slide => 
                slide.id === activeSlideId 
                  ? { ...slide, notes: e.target.value }
                  : slide
              )
              setSlides(updatedSlides)
            }}
          />
        </div>
      )}

      {/* Status Bar */}
      <div className="powerpoint-status-bar">
        <div className="powerpoint-status-left">
          <span>Slide {slides.findIndex(s => s.id === activeSlideId) + 1} of {slides.length}</span>
          <span>English (United States)</span>
        </div>
        <div className="powerpoint-status-right">
          <div className="powerpoint-zoom-controls">
            <button className="powerpoint-zoom-button" onClick={() => setZoom(Math.max(10, zoom - 10))}>
              <ZoomOut className="w-3 h-3" />
            </button>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              max={400}
              min={10}
              step={10}
              className="powerpoint-zoom-slider"
            />
            <button className="powerpoint-zoom-button" onClick={() => setZoom(Math.min(400, zoom + 10))}>
              <ZoomIn className="w-3 h-3" />
            </button>
            <span>{zoom}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PowerPointClone