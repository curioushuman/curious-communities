from diagrams import Diagram
from diagrams.aws.network import APIGatewayEndpoint
from diagrams.aws.integration import EventbridgeCustomEventBusResource

with Diagram("API Admin", show=False, direction="TB", filename="api-admin"):
  APIGatewayEndpoint("/hook/external-event/(course|participant)") >> EventbridgeCustomEventBusResource("cc-events-external")
