from diagrams import Diagram
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource

with Diagram("Course created", show=False, filename="course-upsert"):
  EventbridgeCustomEventBusResource("EXT-course-created") >> LambdaFunction("course-upsert")
