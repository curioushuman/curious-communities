from diagrams import Diagram
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource, SimpleQueueServiceSqs, StepFunctions

graph_attr = {
    "overlap": "false"
}

with Diagram("Course updated", show=False, filename="course-updated", direction="TB", graph_attr=graph_attr):
  ext_event_bus = EventbridgeCustomEventBusResource("EXT\ncourse\ncreated")
  int_event_bus_course_created = EventbridgeCustomEventBusResource("INT\ncourse\ncreated")
  int_event_bus_course_updated = EventbridgeCustomEventBusResource("INT\ncourse\nupdated")
  int_event_bus_participant_created = EventbridgeCustomEventBusResource("INT\nparticipant\ncreated")
  int_event_bus_participant_updated = EventbridgeCustomEventBusResource("INT\nparticipant\nupdated")
  sqs_participant_update = SimpleQueueServiceSqs("participant-update")
  sqs_participant_upsert = SimpleQueueServiceSqs("participant-upsert")
  lambda_course_upsert = LambdaFunction("course-upsert")
  lambda_participant_update = LambdaFunction("participant-update")
  lambda_participant_upsert = LambdaFunction("participant-upsert")
  lambda_participant_update_multi = LambdaFunction("participant-update-multi")
  lambda_participant_upsert_multi = LambdaFunction("participant-upsert-multi")
  sfn_participant_upsert = StepFunctions("participant-upsert")

  ext_event_bus >> lambda_course_upsert
  lambda_course_upsert >> int_event_bus_course_created
  lambda_course_upsert >> int_event_bus_course_updated

  int_event_bus_course_created >> lambda_participant_upsert_multi
  lambda_participant_upsert_multi >> sqs_participant_upsert
  sqs_participant_upsert >> lambda_participant_upsert
  lambda_participant_upsert >> sfn_participant_upsert
  sfn_participant_upsert >> int_event_bus_participant_created
  sfn_participant_upsert >> int_event_bus_participant_updated

  int_event_bus_course_updated >> lambda_participant_update_multi
  lambda_participant_update_multi >> sqs_participant_update
  sqs_participant_update >> lambda_participant_update
  lambda_participant_update >> int_event_bus_participant_updated

