package org.molgenis.rdconnect;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;

@Configuration
public class IdCardConfig
{
	@Autowired
	private ApplicationContext applicationContext;

	@Bean
	public SchedulerFactoryBean schedulerFactoryBean()
	{
		SchedulerFactoryBean quartzScheduler = new SchedulerFactoryBean();
		AutowiringSpringBeanJobFactory jobFactory = new AutowiringSpringBeanJobFactory();
		jobFactory.setApplicationContext(applicationContext);
		quartzScheduler.setJobFactory(jobFactory);
		return quartzScheduler;
	}
}