import GradientDescentStepByStep from './from-gemini/gradient-descent-step-by-step.jsx'
import GradientDescent3D from './from-gemini/3-d-gradient-descent-partial-derivatives.jsx'
import GradientDescent5D from './from-gemini/gradient-descent-in-5-dimensions.jsx'
import InsideMLP from './from-gemini/inside-the-multi-layer-perceptron.jsx'
import RealWorldNNTraining from './from-gemini/real-world-neural-network-training.jsx'

const visualizations = [
  {
    id: 'gradient-descent-step-by-step',
    path: '/gradient-descent-step-by-step',
    title: 'Gradient Descent: Step by Step',
    description:
      'Drag a point along a curve and watch the math compute the next position. Explore how learning rate impacts convergence.',
    icon: '📉',
    tag: 'Calculus · Optimization',
    gradient: 'grad-blue',
    component: GradientDescentStepByStep,
  },
  {
    id: '3d-gradient-descent',
    path: '/3d-gradient-descent',
    title: '3D Gradient Descent',
    description:
      'Explore partial derivatives on a live 3D surface. Two inputs, one output — rotate, drag, and descend in real time.',
    icon: '🌄',
    tag: 'Partial Derivatives · Three.js',
    gradient: 'grad-purple',
    component: GradientDescent3D,
  },
  {
    id: 'gradient-descent-5d',
    path: '/gradient-descent-5d',
    title: 'Gradient Descent in 5 Dimensions',
    description:
      "Optimize 5 parameters simultaneously. When we can't plot the surface, we follow the loss curve downward.",
    icon: '🔭',
    tag: 'High Dimensions · Loss Curve',
    gradient: 'grad-teal',
    component: GradientDescent5D,
  },
  {
    id: 'inside-mlp',
    path: '/inside-mlp',
    title: 'Inside the Multi-Layer Perceptron',
    description:
      'Watch a 2-layer neural network learn in real time — forward pass, BCE loss, backpropagation, and weight updates.',
    icon: '🧠',
    tag: 'Neural Networks · Backprop',
    gradient: 'grad-amber',
    component: InsideMLP,
  },
  {
    id: 'real-world-nn-training',
    path: '/real-world-nn-training',
    title: 'Real-World Neural Network Training',
    description:
      'Train an MLP on real datasets (Breast Cancer, Iris, Auto MPG) and explore loss curves, accuracy, overfitting, and learning rate schedules.',
    icon: '🌍',
    tag: 'MLP · Overfitting · TensorFlow.js',
    gradient: 'grad-teal',
    component: RealWorldNNTraining,
  },
]

export default visualizations
