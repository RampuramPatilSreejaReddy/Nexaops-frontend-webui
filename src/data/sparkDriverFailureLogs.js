// Real Spark driver failure log — parsed from spark_sample_failure.log
// Source: docker exec spark-worker-1, driver-20260703095519-0001/stdout + stderr
// Job: column_determination.py on OCI filesystem

// Full log lines — shown in "View Full Logs" modal
export const SPARK_FULL_LOGS = [
  { ts: "09:55:20", level: "WARN",  svc: "NativeCodeLoader",  msg: "Unable to load native-hadoop library for your platform... using builtin-java classes where applicable" },
  { ts: "09:55:20", level: "INFO",  svc: "SecurityManager",   msg: "Changing view acls to: spark" },
  { ts: "09:55:21", level: "INFO",  svc: "Utils",             msg: "Successfully started service 'Driver' on port 36017." },
  { ts: "09:55:21", level: "INFO",  svc: "DriverWrapper",     msg: "Driver address: 172.20.0.8:36017" },
  { ts: "09:55:21", level: "INFO",  svc: "WorkerWatcher",     msg: "Connecting to worker spark://Worker@172.20.0.8:42623" },
  { ts: "09:55:21", level: "INFO",  svc: "WorkerWatcher",     msg: "Successfully connected to spark://Worker@172.20.0.8:42623" },
  { ts: "09:55:21", level: "INFO",  svc: "TransportClient",   msg: "Successfully created connection to /172.20.0.8:42623 after 20 ms" },
  { ts: "09:55:23", level: "INFO",  svc: "SPARK",             msg: "Running in normal mode with JOB_ID from args: 62cae2d9-9722-4c10-9b88-d666dab4f2ad" },
  { ts: "09:55:24", level: "INFO",  svc: "SPARK",             msg: "OCI jars pre-loaded in /opt/spark/jars — skipping spark.jars.packages" },
  { ts: "09:55:24", level: "INFO",  svc: "SparkContext",      msg: "Running Spark version 4.1.1" },
  { ts: "09:55:24", level: "INFO",  svc: "SparkContext",      msg: "OS info Linux, 6.1.132-147.221.amzn2023.x86_64, amd64" },
  { ts: "09:55:24", level: "INFO",  svc: "SparkContext",      msg: "Java version 17.0.17+10" },
  { ts: "09:55:24", level: "INFO",  svc: "SparkContext",      msg: "Submitted application: local" },
  { ts: "09:55:24", level: "INFO",  svc: "Utils",             msg: "Successfully started service 'sparkDriver' on port 41917." },
  { ts: "09:55:24", level: "INFO",  svc: "SparkEnv",          msg: "Registering MapOutputTracker" },
  { ts: "09:55:24", level: "INFO",  svc: "SparkEnv",          msg: "Registering BlockManagerMaster" },
  { ts: "09:55:24", level: "INFO",  svc: "DiskBlockManager",  msg: "Created local directory at /tmp/blockmgr-b84364b9-60af-42ec-bc46-d8c0c1cd1c7b" },
  { ts: "09:55:24", level: "INFO",  svc: "JettyUtils",        msg: "Start Jetty 0.0.0.0:4040 for SparkUI" },
  { ts: "09:55:24", level: "INFO",  svc: "Executor",          msg: "Starting executor ID driver on host 075be6a51e7c" },
  { ts: "09:55:24", level: "INFO",  svc: "Executor",          msg: "Starting executor with user classpath (userClassPathFirst = false): 'file:/opt/spark/jars/*'" },
  { ts: "09:55:24", level: "INFO",  svc: "BlockManager",      msg: "Using org.apache.spark.storage.RandomBlockReplicationPolicy for block replication policy" },
  { ts: "09:55:24", level: "INFO",  svc: "BlockManager",      msg: "Initialized BlockManager: BlockManagerId(driver, 075be6a51e7c, 44939, None)" },
  { ts: "09:55:25", level: "INFO",  svc: "EventLog",          msg: "Logging events to file:/opt/spark/spark-events/eventlog_v2_local-1783072524862" },
  { ts: "09:55:27", level: "INFO",  svc: "SharedState",       msg: "Warehouse path is 'file:/opt/spark/work/driver-20260703095519-0001/spark-warehouse'." },
  { ts: "09:55:27", level: "INFO",  svc: "BmcFilesystem",     msg: "BmcFilesystem caching disabled" },
  { ts: "09:55:27", level: "INFO",  svc: "BmcFilesystem",     msg: "Creating new BmcFilesystemImpl delegate for oci://dataset-testing@bmwcmlxujsej/..." },
  { ts: "09:55:27", level: "INFO",  svc: "BmcFilesystemImpl", msg: "Attempting to initialize filesystem with URI oci://dataset-testing@bmwcmlxujsej/..." },
  { ts: "09:55:27", level: "INFO",  svc: "BmcFilesystemImpl", msg: "Initialized filesystem for namespace bmwcmlxujsej and bucket dataset-testing" },
  { ts: "09:55:27", level: "WARN",  svc: "FileStreamSink",    msg: "Assume no metadata directory. Error while looking for metadata directory in path: oci://dataset-testing@bmwcmlxujsej/..." },
  { ts: "09:55:27", level: "ERROR", svc: "BmcFilesystem",     msg: "com.google.common.util.concurrent.ExecutionError: java.lang.NoClassDefFoundError: com/oracle/bmc/http/client/jersey/JerseyClientProperty" },
  { ts: "09:55:27", level: "ERROR", svc: "BmcFilesystem",     msg: "  at com.oracle.bmc.hdfs.BmcFilesystem.initialize(BmcFilesystem.java:185) ~[oci-hdfs-connector-3.4.1.0.0.5.jar]" },
  { ts: "09:55:27", level: "ERROR", svc: "BmcFilesystem",     msg: "  at org.apache.hadoop.fs.FileSystem.createFileSystem(FileSystem.java:3615) ~[hadoop-client-api-3.4.2.jar]" },
  { ts: "09:55:27", level: "ERROR", svc: "BmcFilesystem",     msg: "  at org.apache.spark.sql.execution.datasources.DataSource.resolveRelation(DataSource.scala:384)" },
  { ts: "09:55:27", level: "ERROR", svc: "BmcFilesystem",     msg: "Caused by: java.lang.NoClassDefFoundError: com/oracle/bmc/http/client/jersey/JerseyClientProperty" },
  { ts: "09:55:27", level: "ERROR", svc: "BmcFilesystem",     msg: "  at com.oracle.bmc.hdfs.BmcFilesystemImpl.initialize(BmcFilesystem.java:473) ~[oci-hdfs-connector-3.4.1.0.0.5.jar]" },
  { ts: "09:55:27", level: "ERROR", svc: "BmcFilesystem",     msg: "Caused by: java.lang.ClassNotFoundException: com.oracle.bmc.http.client.jersey.JerseyClientProperty" },
  { ts: "09:55:27", level: "ERROR", svc: "BmcFilesystem",     msg: "  at java.base/jdk.internal.loader.BuiltinClassLoader.loadClass(BuiltinClassLoader.java:641)" },
  { ts: "09:55:27", level: "ERROR", svc: "py4j",              msg: "py4j.protocol.Py4JJavaError: An error occurred while calling o80.csv." },
  { ts: "09:55:27", level: "ERROR", svc: "py4j",              msg: "  com.google.common.util.concurrent.ExecutionError: java.lang.NoClassDefFoundError: com/oracle/bmc/http/client/jersey/JerseyClientProperty" },
  { ts: "09:55:27", level: "ERROR", svc: "PySpark",           msg: "Traceback: File column_determination.py, line 62, in <module>" },
  { ts: "09:55:27", level: "ERROR", svc: "PySpark",           msg: "  column_determination(job_id=job_id, rerun=rerun)" },
  { ts: "09:55:27", level: "ERROR", svc: "PySpark",           msg: "  File context.py, line 297: ctx = buildFileContext(ctx, enforce_force_datatype=enforce_force_datatype)" },
  { ts: "09:55:27", level: "ERROR", svc: "PySpark",           msg: "  File context.py, line 202: df = sparkReadData(spark=spark, extension=extension, directory=paths)" },
  { ts: "09:55:27", level: "ERROR", svc: "PySpark",           msg: "  File spark_read_data.py, line 5: spark_frame = spark.read.csv(path=directory, sep=separator, ...)" },
  { ts: "09:55:27", level: "FATAL", svc: "SPARK",             msg: "Driver stopped with exitCode 1 from shutdown hook" },
]

// Preview — only the 5 most critical lines shown inline in the Error Logs card
// (errors and fatal only, most relevant ones)
export const SPARK_PREVIEW_LOGS = SPARK_FULL_LOGS.filter(l =>
  l.level === 'FATAL' ||
  (l.level === 'ERROR' && (
    l.msg.includes('NoClassDefFoundError') ||
    l.msg.includes('ClassNotFoundException') ||
    l.msg.includes('Py4JJavaError') ||
    l.msg.includes('Traceback') ||
    l.msg.includes('exitCode')
  ))
).slice(0, 5)
