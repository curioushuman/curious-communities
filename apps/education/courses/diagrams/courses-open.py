from diagrams import Diagram
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource, SimpleQueueServiceSqs
from diagrams.aws.database import Dynamodb

graph_attr = {
    "pad": "0.75",
}

with Diagram("Open courses", show=False, filename="courses-open", direction="TB", graph_attr=graph_attr):
  int_event_bus_course_scheduled = EventbridgeCustomEventBusResource("INT\ncourse\nschedule(daily)")
  int_event_bus_course_updated = EventbridgeCustomEventBusResource("INT\ncourse\nupdated")
  sqs_course_update = SimpleQueueServiceSqs("course-update")
  lambda_course_update = LambdaFunction("course-update")
  lambda_course_open = LambdaFunction("course-open-multi")
  ddb_courses = Dynamodb("courses")

  int_event_bus_course_scheduled >> lambda_course_open
  lambda_course_open >> sqs_course_update
  sqs_course_update >> lambda_course_update
  lambda_course_update >> ddb_courses
  lambda_course_update >> int_event_bus_course_updated

