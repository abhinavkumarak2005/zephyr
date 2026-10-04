-- 0010_update_problem_statement_3.sql

UPDATE public.problem_statements
SET 
  domain = 'Sustainable Resource Management',
  title = 'Optimizing Local Resource Management for Environmental Sustainability through Continuous Monitoring and Behavioral Insights',
  description = 'Residential spaces, educational campuses, and small enterprises often lack real-time visibility into their daily consumption of essential resources, particularly water, energy, and waste. Without centralized, actionable data, individuals and facility managers struggle to identify inefficiencies, understand consumption patterns, and implement targeted conservation measures. Unnoticed infrastructure failures, especially hidden water leaks across supply pipelines and distributed plumbing networks, can lead to significant and cumulative resource loss before they are detected manually. Traditional monitoring approaches often fail to identify abnormal consumption or flow patterns and provide timely alerts to stakeholders. As a result, leaks and other inefficiencies may continue unchecked, contributing to unnecessary resource wastage and environmental damage. The proposed solution should leverage real-time monitoring, data analytics, and intelligent alerts to identify resource inefficiencies, encourage sustainable consumption practices, detect abnormal usage patterns, and support effective water, energy, and waste conservation.'
WHERE id = 3;
