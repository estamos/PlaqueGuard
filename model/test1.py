import onnx
from onnx_tf.backend import prepare

# Load ONNX model
onnx_model = onnx.load('model.onnx')

# Convert to TensorFlow
tf_rep = prepare(onnx_model)

# Export as SavedModel
tf_rep.export_graph('saved_model')
