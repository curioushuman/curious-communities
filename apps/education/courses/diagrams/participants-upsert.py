from diagrams import Diagram
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource, SimpleQueueServiceSqs, StepFunctions

graph_attr = {
    "overlap": "false"
}

with Diagram("Upsert participants", show=False, filename="participants-upsert", direction="TB", graph_attr=graph_attr):
  int_event_bus_course_created = EventbridgeCustomEventBusResource("INT\ncourse\ncreated")
  int_event_bus_participant_created = EventbridgeCustomEventBusResource("INT\nparticipant\ncreated")
  int_event_bus_participant_updated = EventbridgeCustomEventBusResource("INT\nparticipant\nupdated")
  sqs_participant_upsert = SimpleQueueServiceSqs("participant-upsert")
  lambda_participant_upsert = LambdaFunction("participant-upsert")
  lambda_participant_upsert_multi = LambdaFunction("participant-upsert-multi")
  sfn_participant_upsert = StepFunctions("participant-upsert")

  int_event_bus_course_created >> lambda_participant_upsert_multi
  lambda_participant_upsert_multi >> sqs_participant_upsert
  sqs_participant_upsert >> lambda_participant_upsert
  lambda_participant_upsert >> sfn_participant_upsert
  sfn_participant_upsert >> int_event_bus_participant_created
  sfn_participant_upsert >> int_event_bus_participant_updated
