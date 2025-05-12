import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

class HealNet(nn.Module):
    def __init__(self, tabular_dim, num_classes, dropout_rate=0.3):
        super(HealNet, self).__init__()
        self.image_model = efficientnet_b0(weights=EfficientNet_B0_Weights.IMAGENET1K_V1)
        
        # Freeze early layers (optional)
        for param in list(self.image_model.parameters())[:-10]:
            param.requires_grad = False

        # Replace classifier to get 128-dim features
        self.image_model.classifier = nn.Sequential(
            nn.Linear(1280, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(dropout_rate)
        )

        # Tabular network
        self.tabular_network = nn.Sequential(
            nn.Linear(tabular_dim, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(dropout_rate)
        )

        # Attention and classifier
        self.attention = nn.Sequential(
            nn.Linear(128 + 32, 2),
            nn.Softmax(dim=1)
        )

        self.classifier = nn.Sequential(
            nn.Linear(128 + 32, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(64, num_classes)
        )

    def forward(self, tabular_data, image_data):
        tabular_features = self.tabular_network(tabular_data)

        # Process systolic/diastolic images
        batch_size = image_data.size(0)
        image_features = []
        for i in range(2):  # 0: systolic, 1: diastolic
            img = image_data[:, i, :, :, :]
            feat = self.image_model(img)
            image_features.append(feat)

        image_features = torch.stack(image_features, dim=1)
        image_features = torch.mean(image_features, dim=1)

        # Combine with tabular data
        combined_features = torch.cat((tabular_features, image_features), dim=1)
        attention_weights = self.attention(combined_features)

        image_weight = torch.clamp(attention_weights[:, 1], max=0.55)
        tabular_weight = 1.0 - image_weight
        attention_weights = torch.stack([tabular_weight, image_weight], dim=1)

        weighted_tabular = tabular_features * attention_weights[:, 0].unsqueeze(1)
        weighted_image = image_features * attention_weights[:, 1].unsqueeze(1)
        weighted_combined = torch.cat((weighted_tabular, weighted_image), dim=1)

        output = self.classifier(weighted_combined)
        return output, attention_weights

# Load checkpoint
checkpoint = torch.load('healnet_carotid_risk_bestfold3_model.pth', map_location='cpu')

# Initialize model with correct parameters
model = HealNet(
    tabular_dim=checkpoint['input_dim'],  # Get from checkpoint metadata
    num_classes=len(checkpoint['class_names']),  # Get from checkpoint metadata
    dropout_rate=0.3
)

# Load the actual model weights (not the full checkpoint)
state_dict = checkpoint['model_state_dict']

# Remove 'module.' prefix if present (from DataParallel)
state_dict = {k.replace('module.', ''): v for k, v in state_dict.items()}

# Load state dict
model.load_state_dict(state_dict)
model.eval()

# Print model structure to verify
print(model)

# Create dummy inputs for ONNX export
batch_size = 1
num_channels = 3
image_size = 224

dummy_tabular = torch.randn(batch_size, checkpoint['input_dim'])
dummy_images = torch.randn(batch_size, 2, num_channels, image_size, image_size)

# Export to ONNX
torch.onnx.export(
    model,
    (dummy_tabular, dummy_images),
    'healnet_model.onnx',
    input_names=['tabular_data', 'image_data'],
    output_names=['output', 'attention_weights'],
    dynamic_axes={
        'tabular_data': {0: 'batch_size'},
        'image_data': {0: 'batch_size', 1: 'num_images'},
        'output': {0: 'batch_size'},
        'attention_weights': {0: 'batch_size'}
    },
    opset_version=12,
    verbose=True
)

print("Model successfully exported to healnet_model.onnx")